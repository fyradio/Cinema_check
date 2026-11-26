import { chromium } from 'playwright-core';
import fs from 'node:fs';
fs.mkdirSync('out/js', { recursive: true });
const SKIP = /google|facebook|doubleclick|gstatic|clarity|hotjar|criteo|yahoo|line-scdn|tiktok|adsrvr|scorecard|cloudflareinsights|youtube/i;
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const ctx = await b.newContext({ locale: 'zh-TW', timezoneId: 'Asia/Taipei', viewport: { width: 1280, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
let jsn = 0;
async function probe(name, url, act) {
  const pg = await ctx.newPage(); const reqs = [];
  pg.on('requestfinished', async r => {
    const u = r.url(); if (SKIP.test(u)) return;
    const t = r.resourceType(); let status = 0, body = '';
    try { const res = await r.response(); status = res.status();
      if (t === 'script') { const s = await res.text(); if (s.length < 2e6) { const f = `out/js/${name}-${++jsn}.js`; fs.writeFileSync(f, s); body = f; } }
      else if (['xhr', 'fetch', 'document', 'other'].includes(t)) body = (await res.text()).slice(0, 6000);
    } catch (e) { body = 'ERR ' + e.message; }
    if (['xhr', 'fetch', 'document', 'script', 'other'].includes(t)) reqs.push({ t, m: r.method(), u, post: r.postData(), status, body });
  });
  let note = '';
  try { await pg.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); if (act) note = await act(pg); await pg.waitForTimeout(2500); }
  catch (e) { note += ' ERROR ' + e.message; }
  try { fs.writeFileSync(`out/${name}.html`, await pg.content()); await pg.screenshot({ path: `out/${name}.png`, fullPage: false }); } catch {}
  fs.writeFileSync(`out/${name}.json`, JSON.stringify({ url, final: pg.url(), note, reqs }, null, 1));
  console.log(name, pg.url(), reqs.length, note?.slice?.(0, 300));
  await pg.close();
}
await probe('vs_showtimes', 'https://www.vscinemas.com.tw/ShowTimes/', async pg => {
  const opts = await pg.$$eval('select option', os => os.map(o => [o.value, o.textContent.trim()]));
  await pg.selectOption('select', { label: '新竹大遠百威秀影城' }); await pg.waitForTimeout(4000);
  await pg.selectOption('select', { label: '新竹巨城威秀影城' }); await pg.waitForTimeout(4000);
  await pg.selectOption('select', { label: '新竹大遠百威秀影城 (GC)' }); await pg.waitForTimeout(4000);
  return JSON.stringify(opts);
});
await probe('vs_theater7', 'https://www.vscinemas.com.tw/theater/detail.aspx?id=7');
await probe('vs_films', 'https://www.vscinemas.com.tw/film/index.aspx', async pg => {
  const links = await pg.$$eval('a[href*="detail.aspx"]', as => as.map(a => a.href).slice(0, 5));
  if (links[0]) { await pg.goto(links[0], { waitUntil: 'networkidle', timeout: 45000 }); fs.writeFileSync('out/vs_filmdetail.html', await pg.content()); }
  return JSON.stringify(links);
});
await probe('bw_home', 'https://www.broadway-cineplex.com.tw/');
await probe('bw_book', 'https://www.broadway-cineplex.com.tw/book.html?obj=Taipei');
await probe('ezding_fe21', 'https://www.ezding.com.tw/cinemabooking?cinemaid=40288eb0050f542401050f5573651ca2');
await probe('at_movie', 'https://www.atmovies.com.tw/movie/fgjp34384661/');
await probe('imdb_title', 'https://www.imdb.com/title/tt0111161/');
const extra = {};
for (const u of ['https://datasets.imdbws.com/title.ratings.tsv.gz', 'https://v3.sg.media-imdb.com/suggestion/x/godzilla%20minus%20zero.json', 'https://www.imdb.com/title/tt0111161/']) {
  try { const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }); const buf = Buffer.from(await r.arrayBuffer());
    extra[u] = { status: r.status, len: buf.length, head: u.endsWith('.gz') ? '' : buf.toString('utf8').slice(0, 3000) };
  } catch (e) { extra[u] = { err: e.message }; }
}
fs.writeFileSync('out/extra.json', JSON.stringify(extra, null, 1));
await b.close();
