// 威秀影城：一週場次（GetShowTimes，一般 fetch 即可）＋電影頁的訂票連結與售完狀態（要用真瀏覽器）
import { clean, getText, norm, mdToDate, RATING, UA } from './util.mjs';
import { THEATERS } from './theaters.mjs';

export const VS = Object.fromEntries(THEATERS.filter(t => t.source === 'vieshow').map(t => [t.key, t]));
const BASE = 'https://www.vscinemas.com.tw';

// 解析 GetShowTimes 回傳的 HTML
export function parseShowTimes(html, today) {
  const out = [];
  const blocks = String(html).split(/<strong class="[^"]*LangTW MovieName[^"]*">/).slice(1);
  for (const b of blocks) {
    const zhRaw = clean(b.split('</strong>')[0]);
    const enM = /LangEN MovieName[^>]*>([\s\S]*?)<\/strong>/.exec(b);
    const enRaw = enM ? clean(enM[1]) : '';
    let title = zhRaw, version = '', rating = '';
    const pre = /^\(([^)]*)\)\s*/.exec(title); if (pre) { version = pre[1].trim(); title = title.slice(pre[0].length); }
    const suf = /\s*\(([^()]*)\)\s*$/.exec(title); if (suf && (RATING[suf[1]] !== undefined || /級|待定/.test(suf[1]))) { rating = RATING[suf[1]] ?? ''; title = title.slice(0, suf.index); }
    const en = enRaw.replace(/^\([^)]*\)\s*/, '').replace(/\s*\([^()]*\)\s*$/, '');
    const re = /LangTW RealShowDate[^>]*>([\s\S]*?)<\/strong>|<div class="col-xs-0">\s*(\d{1,2}:\d{2})/g;
    let m, date = null;
    while ((m = re.exec(b))) {
      if (m[1] !== undefined) { const d = /(\d{1,2})月(\d{1,2})日/.exec(clean(m[1])); date = d ? mdToDate(+d[1], +d[2], today) : null; }
      else if (date) out.push({ title, en, version, rating, date, time: m[2].padStart(5, '0') });
    }
  }
  return out;
}

export async function weekSchedule(code, today) {
  const html = await getText(`${BASE}/ShowTimes//ShowTimes/GetShowTimes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest', Referer: `${BASE}/ShowTimes/` },
    body: 'CinemaCode=' + code
  });
  return parseShowTimes(html, today);
}

// 在電影頁裡執行：抓片名、海報、片長、各版本各影城每天的場次與底色
export function extractDetail(theaterIds) {
  const T = s => (s || '').replace(/\s+/g, ' ').trim();
  const q = s => document.querySelector(s);
  const out = {
    zh: T(q('.titleArea h1')?.textContent), en: T(q('.titleArea h2')?.textContent),
    release: ((q('.titleArea time')?.textContent || '').match(/\d{4}\/\d{2}\/\d{2}/) || [''])[0].replace(/\//g, '-'),
    poster: q('.movieMain figure img')?.src || '', runtime: 0,
    films: [...document.querySelectorAll('select option')].filter(o => /^\d{3,6}$/.test(o.value)).map(o => [o.value, T(o.textContent)]),
    sessions: []
  };
  for (const tr of document.querySelectorAll('.infoArea tr')) {
    const tds = tr.querySelectorAll('td'); if (tds.length < 2) continue;
    const k = T(tds[0].textContent), cell = tds[1];
    const v = [...cell.querySelectorAll('p')].length ? cell.innerText.split(/\n+/).map(T).filter(Boolean).join('、') : T(cell.textContent);
    if (/片長/.test(k)) { const m = v.match(/(\d+)\s*時\s*(\d+)\s*分/); if (m) out.runtime = +m[1] * 60 + +m[2]; }
    else if (/導演/.test(k)) out.director = v;
    else if (/演員/.test(k)) out.cast = v;
    else if (/類型/.test(k)) out.genre = v;
  }
  const story = document.querySelector('.movieStory .bbsArticle');
  out.intro = story ? story.innerText.split(/\n+/).map(T).filter(Boolean).join('\n') : '';
  const rgb = s => (s.match(/\d+(\.\d+)?/g) || []).map(Number);
  for (const v of document.querySelectorAll('.versionList > li')) {
    const label = T(v.querySelector('a.versionFirst')?.textContent);
    for (const a of v.querySelectorAll('a[href^="#movieTime"]')) {
      const id = a.getAttribute('href').slice(1), theater = id.split('_').pop();
      if (!theaterIds.includes(theater)) continue;
      const art = document.getElementById(id); if (!art) continue;
      for (const day of art.querySelectorAll('.movieDay')) {
        const d = (day.querySelector('h4')?.textContent || '').match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})/);
        if (!d) continue;
        const date = `${d[1]}-${d[2].padStart(2, '0')}-${d[3].padStart(2, '0')}`;
        for (const li of day.querySelectorAll('ul.bookList li')) {
          const link = li.querySelector('a'); if (!link) continue;
          const sid = (link.href.match(/txtSessionId=(\d+)/i) || [])[1];
          let status = '';
          for (const el of [li, link]) {
            const [r, g, b, al = 1] = rgb(getComputedStyle(el).backgroundColor);
            if (al === 0 || r === undefined) continue;
            if (r > 170 && g < 110 && b < 110) status = 'soldout';
            else if (r > 190 && g > 160 && b < 140 && !status) status = 'few';
          }
          if (!status && /sold|full|over/i.test(li.className)) status = 'soldout';
          else if (!status && /soon|few|less|almost|warn/i.test(li.className)) status = 'few';
          out.sessions.push({ version: label, theater, date, time: T(link.textContent), sid, cls: li.className, bg: getComputedStyle(li).backgroundColor + '|' + getComputedStyle(link).backgroundColor, status });
        }
      }
    }
  }
  return out;
}

export async function detailPages(browser, wantedTitles, log) {
  const ctx = await browser.newContext({ locale: 'zh-TW', timezoneId: 'Asia/Taipei', userAgent: UA });
  await ctx.route('**/*', r => ['image', 'font', 'media'].includes(r.request().resourceType()) || /google|facebook|doubleclick|mpulse|akstat/.test(r.request().url()) ? r.abort() : r.continue());
  const pg = await ctx.newPage();
  const theaterIds = Object.values(VS).flatMap(v => v.theaterIds);
  const open = async id => {
    await pg.goto(`${BASE}/film/detail.aspx?id=${id}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await pg.waitForSelector('.titleArea h1', { timeout: 20000 });
    return pg.evaluate(extractDetail, theaterIds);
  };
  // 先從片單頁拿任一部電影的 id，電影頁的下拉選單有全部片名
  await pg.goto(`${BASE}/film/index.aspx`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const firstIds = await pg.$$eval('a[href*="detail.aspx?id="]', as => [...new Set(as.map(a => (a.href.match(/id=(\d+)/) || [])[1]).filter(Boolean))]);
  if (!firstIds.length) throw new Error('威秀片單頁沒有電影連結');
  const first = await open(firstIds[0]);
  const all = new Map(first.films);
  for (const id of firstIds) if (!all.has(id)) all.set(id, '');
  const want = new Set(wantedTitles.map(norm));
  const ids = [...all].filter(([id, name]) => name && want.has(norm(name))).map(([id]) => id);
  log(`威秀電影頁：片單 ${all.size} 部，新竹有上映的 ${ids.length} 部`);
  const out = [];
  for (const id of ids) {
    try { const d = id === firstIds[0] ? first : await open(id); out.push({ id, ...d, films: undefined }); }
    catch (e) { log(`威秀電影頁 ${id} 失敗：${e.message}`); }
  }
  await ctx.close();
  return out;
}

export const bookUrl = (cinemacode, sid) => `${BASE}/vsTicketing//ticketing/booking.aspx?cinemacode=${cinemacode}&txtSessionId=${sid}`;
export const seatUrl = (cinemacode, sid) => `https://sales.vscinemas.com.tw/VoucherTicketing/SessionSeats.aspx?CinemaCode=${cinemacode}&txtSessionId=${sid}`;
export const filmUrl = id => `${BASE}/film/detail.aspx?id=${id}`;
