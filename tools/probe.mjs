import { chromium } from 'playwright-core';
import fs from 'node:fs';
fs.rmSync('out', { recursive: true, force: true });
fs.mkdirSync('out2', { recursive: true });
const SKIP = /google|facebook|doubleclick|gstatic|clarity|hotjar|criteo|yahoo|line-scdn|tiktok|adsrvr|scorecard|cloudflareinsights|youtube|mpulse|\.png|\.jpg|\.gif|\.woff|\.css/i;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const ctx = await b.newContext({ locale: 'zh-TW', timezoneId: 'Asia/Taipei', viewport: { width: 1280, height: 900 }, userAgent: UA });
async function probe(name, url, act) {
  const pg = await ctx.newPage(); const reqs = [];
  pg.on('requestfinished', async r => {
    const u = r.url(); if (SKIP.test(u)) return; const t = r.resourceType(); let status = 0, body = '';
    try { const res = await r.response(); status = res.status(); const s = await res.text();
      if (t === 'script') { if (/broadway|vscinemas/.test(u)) { const f = `out2/${name}-${u.split('/').pop().split('?')[0]}`; fs.writeFileSync(f, s); body = f; } }
      else body = s.slice(0, 20000); } catch (e) { body = 'ERR ' + e.message; }
    reqs.push({ t, m: r.method(), u, post: r.postData(), status, body });
  });
  let note = '';
  try { await pg.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); if (act) note = await act(pg); await pg.waitForTimeout(2500); } catch (e) { note += ' ERROR ' + e.message; }
  try { fs.writeFileSync(`out2/${name}.html`, await pg.content()); await pg.screenshot({ path: `out2/${name}.png`, fullPage: true }); } catch {}
  fs.writeFileSync(`out2/${name}.json`, JSON.stringify({ url, final: pg.url(), note, reqs }, null, 1));
  console.log(name, pg.url(), reqs.length, String(note).slice(0, 300)); await pg.close();
}
const get = async u => { const r = await fetch(u, { headers: { 'User-Agent': UA } }); return r.text(); };
// Broadway
const BW = 'https://www.broadway-cineplex.com.tw/';
const list = JSON.parse(await get(BW + 'Movie/GetMovieList/Zhubei'));
fs.writeFileSync('out2/bw_list.json', JSON.stringify(list, null, 1));
const withDates = list.Data.filter(m => m.datedata && m.datedata.length);
let q = null;
for (const m of withDates.slice(0, 3)) {
  for (const d of m.datedata.slice(0, 2)) {
    const t = JSON.parse(await get(BW + `Movie/GetMovieAlltime/Zhubei/${m.programid}/${d.date}`));
    fs.writeFileSync(`out2/bw_time_${m.programid}_${d.date}.json`, JSON.stringify(t, null, 1));
    const s = t.Data?.flatMap(x => x.subtimedata || []).find(x => !x.disable);
    if (s && !q) q = `quick-view.html?obj=Zhubei,${m.programid},${s.showdate},${s['時間'].replace(':', '-')},${s.hall}`;
  }
}
console.log('quick', q);
if (q) await probe('bw_quick', BW + q);
await probe('bw_single', BW + `book.html?obj=Zhubei&pid=${withDates[0]?.programid}`);
// Vieshow seat page + several film details for li classes
await probe('vs_seats', 'https://sales.vscinemas.com.tw/VoucherTicketing/SessionSeats.aspx?CinemaCode=14&txtSessionId=673560');
await probe('vs_booking', 'https://www.vscinemas.com.tw/vsTicketing//ticketing/booking.aspx?cinemacode=14&txtSessionId=673560');
const classes = {};
for (const id of [9029, 8941, 9037, 9138, 8985, 9042]) {
  const h = await get(`https://www.vscinemas.com.tw/film/detail.aspx?id=${id}`);
  for (const m of h.matchAll(/<li class="([^"]*)"><a href="https:\/\/www\.vscinemas\.com\.tw\/vsTicketing/g)) classes[m[1]] = (classes[m[1]] || 0) + 1;
  if (id === 9138) fs.writeFileSync('out2/vs_detail_9138.html', h);
}
fs.writeFileSync('out2/vs_li_classes.json', JSON.stringify(classes));
// css hints
const css = await get('https://www.unicornpopcorn.com.tw/ForVsWeb/css/style.css').catch(() => '');
fs.writeFileSync('out2/vs_style_bookList.txt', (css.match(/[^}]*bookList[^}]*}/g) || []).join('\n'));
// vieshow GetShowTimes direct POST
const r = await fetch('https://www.vscinemas.com.tw/ShowTimes//ShowTimes/GetShowTimes', { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' }, body: 'CinemaCode=BC' });
fs.writeFileSync('out2/vs_getshowtimes_BC.html', await r.text());
await b.close();
