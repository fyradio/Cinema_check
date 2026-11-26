import { chromium } from 'playwright-core';
import fs from 'node:fs';
fs.mkdirSync('out3', { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const BW = 'https://www.broadway-cineplex.com.tw/';
const J = async u => (await fetch(u, { headers: { 'User-Agent': UA } })).json();
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());
const res = { today, bw: [], vs: {} };
const list = (await J(BW + 'Movie/GetMovieList/Zhubei')).Data;
const sess = [];
for (const m of list) for (const d of (m.datedata || []).slice(0, 2)) {
  const t = await J(BW + `Movie/GetMovieAlltime/Zhubei/${m.programid}/${d.date}`);
  for (const s of (t.Data || []).flatMap(x => x.subtimedata || [])) if (!s.disable) sess.push({ pid: m.programid, name: m.cname, ...s });
}
for (const s of sess.slice(0, 60)) {
  const r = await J(BW + `Movie/GetSeatView/Zhubei/${s.pid}/${s.showdate}/${s['時間'].replace(':', '-')}/${s.hall}`);
  const k = {}; const samples = {};
  for (const row of r.Data || []) for (const c of row.cols || []) { const key = c.seatkind + '/' + c.choice + '/' + (c.colname ? 'n' : '-'); k[key] = (k[key] || 0) + 1; if (!samples[c.seatkind]) samples[c.seatkind] = c; }
  res.bw.push({ name: s.name, date: s.showdate, time: s['時間'], hall: s.hallname, k, samples });
}
fs.writeFileSync('out3/res.json', JSON.stringify(res, null, 1));
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const ctx = await b.newContext({ locale: 'zh-TW', userAgent: UA });
const pg = await ctx.newPage();
// 找 '-' 或 '9' 最多的一場，畫出座位圖看 class
const pick = [...res.bw].sort((a, b) => ((b.k['-/N/-'] || 0) + (b.k['-/N/n'] || 0) + (b.k['9/N/n'] || 0) + (b.k['9/N/-'] || 0)) - ((a.k['-/N/-'] || 0) + (a.k['-/N/n'] || 0) + (a.k['9/N/n'] || 0) + (a.k['9/N/-'] || 0)))[0];
const ps = sess.find(s => s.name === pick.name && s.showdate === pick.date && s['時間'] === pick.time);
await pg.goto(BW + `quick-view.html?obj=Zhubei,${ps.pid},${ps.showdate},${ps['時間'].replace(':', '-')},${ps.hall}`, { waitUntil: 'load', timeout: 60000 });
await pg.waitForTimeout(2000);
res.bwRendered = await pg.evaluate(() => { const c = {}; for (const el of document.querySelectorAll('.td-block')) { const k = el.className + '|' + el.textContent.trim().replace(/\d+/g, 'N'); c[k] = (c[k] || 0) + 1; } return { c, html: document.querySelector('.table')?.innerHTML.slice(0, 4000) }; });
res.bwPick = pick;
await pg.screenshot({ path: 'out3/bw_quick.png', fullPage: true });
// 威秀：讀樣式表裡跟 bookList 有關的規則，以及熱門片今晚的 li 底色
await pg.goto('https://www.vscinemas.com.tw/film/detail.aspx?id=9029', { waitUntil: 'domcontentloaded', timeout: 60000 });
await pg.waitForTimeout(3000);
res.vs = await pg.evaluate(() => {
  const rules = [];
  for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) if (/bookList|soldout|sellout|almost/i.test(r.cssText)) rules.push(r.cssText.slice(0, 300)); } catch (e) { rules.push('ERR ' + sh.href); } }
  const lis = {}; for (const li of document.querySelectorAll('ul.bookList li')) { const a = li.querySelector('a'); const k = li.className + '|' + getComputedStyle(li).backgroundColor + '|' + (a ? getComputedStyle(a).backgroundColor : ''); lis[k] = (lis[k] || 0) + 1; }
  return { rules, lis, title: document.title };
});
fs.writeFileSync('out3/res.json', JSON.stringify(res, null, 1));
await b.close();
