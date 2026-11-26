// 由 GitHub Actions 定時執行，產生 data/showtimes.json（v2）
//   威秀：一週場次＋訂票連結＋快售完/完售
//   百老匯竹北：一週場次＋剩餘座位
//   IMDb 評分、海報原圖與縮圖
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';
import { norm, taipeiToday, addDays, getText } from './lib/util.mjs';
import { VS, weekSchedule, detailPages, bookUrl, seatUrl, filmUrl } from './lib/vieshow.mjs';
import { broadway, bwBook, bwSeat } from './lib/broadway.mjs';
import { resolveImdb, loadRatings } from './lib/imdb.mjs';
import { savePosters } from './lib/posters.mjs';

const require = createRequire(import.meta.url);
const atParser = require('../parser.js');
const root = new URL('../', import.meta.url);
const readJSON = async (p, d) => { try { return JSON.parse(await readFile(new URL(p, root), 'utf8')); } catch { return d; } };
const logs = [];
const log = s => { console.log(s); logs.push(s); };

const today = taipeiToday();
const lastDay = addDays(today, 13);
const previous = await readJSON('data/showtimes.json', {});
const imdbCache = await readJSON('data/imdb-cache.json', {});
const posterManifest = await readJSON('data/posters.json', {});
const errors = [];

// ---------- 威秀 ----------
const vsWeek = [];
for (const [cinema, conf] of Object.entries(VS)) {
  for (const [code, tag] of Object.entries(conf.codes)) {
    try {
      const rows = await weekSchedule(code, today);
      for (const r of rows) vsWeek.push({ ...r, cinema, version: tag ? (/\bGC\b/.test(r.version) ? r.version.replace(/\bGC\b/, tag) : [tag, r.version].filter(Boolean).join(' ')) : r.version });
      log(`威秀 ${code}：${rows.length} 場`);
    } catch (e) { errors.push(`威秀 ${code}：${e.message}`); log(`威秀 ${code} 失敗：${e.message}`); }
  }
}

let vsDetails = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true });
  vsDetails = await detailPages(browser, [...new Set(vsWeek.map(r => r.title))], log);
} catch (e) { errors.push(`威秀電影頁：${e.message}`); log(`威秀電影頁失敗：${e.message}`); }
finally { if (browser) await browser.close(); }

// ---------- 百老匯 ----------
let bw = { sessions: [] };
try { bw = await broadway({ seatDays: 2, today, log }); }
catch (e) { errors.push(`百老匯：${e.message}`); log(`百老匯失敗：${e.message}`); }

// ---------- 開眼（只拿今天的 IMDb 編號提示） ----------
const atHint = {};
for (const code of ['t03505', 't03508', 't03510']) {
  try {
    const d = atParser.parse(await getText(`https://www.atmovies.com.tw/showtime/${code}/a35/`));
    for (const m of d.movies) { const n = (m.id.match(/(\d{7,9})$/) || [])[1]; if (n) atHint[norm(m.title)] = 'tt' + n; }
  } catch (e) { log(`開眼 ${code}：${e.message}`); }
}

// ---------- 合併電影 ----------
const movies = new Map();   // norm 片名 → 電影
const movieOf = (title, extra = {}) => {
  const k = norm(title);
  if (!movies.has(k)) movies.set(k, { key: k, title, en: '', rating: '', runtime: 0, release: '', zhPosters: [], vsId: '', bwPid: '' });
  const m = movies.get(k);
  for (const [f, v] of Object.entries(extra)) {
    if (!v) continue;
    if (f === 'poster') { if (!m.zhPosters.includes(v)) m.zhPosters.push(v); }
    else if (!m[f]) m[f] = v;
  }
  return m;
};

const vsIndex = new Map();
const bgStat = {};
for (const d of vsDetails) for (const s of d.sessions) { const k = `${s.cls}|${s.bg}|${s.status}`; bgStat[k] = (bgStat[k] || 0) + 1; }
log(`威秀時段底色統計：${JSON.stringify(bgStat)}`);
for (const d of vsDetails) {
  const m = movieOf(d.zh, { en: d.en, runtime: d.runtime, release: d.release, poster: d.poster, vsId: d.id });
  for (const s of d.sessions) {
    const cinema = Object.keys(VS).find(c => VS[c].theaterIds.includes(s.theater));
    const k = `${cinema}|${s.date}|${s.time}|${m.key}`;
    if (!vsIndex.has(k)) vsIndex.set(k, []);
    vsIndex.get(k).push(s);
  }
}

const sessions = [];
const usedDetail = new Set();
for (const r of vsWeek) {
  const m = movieOf(r.title, { en: r.en.replace(/\b\w+/g, w => w[0] + w.slice(1).toLowerCase()), rating: r.rating });
  if (r.rating && !m.rating) m.rating = r.rating;
  const k = `${r.cinema}|${r.date}|${r.time}|${m.key}`;
  const cands = vsIndex.get(k) || [];
  const isGC = /gold/i.test(r.version);
  const free = cands.filter(c => !usedDetail.has(c));
  const det = free.find(c => /GC|GOLD/i.test(c.version) === isGC) || free[0] || null;
  if (det) usedDetail.add(det);
  const cc = VS[r.cinema].cinemacode;
  sessions.push({
    m: m.key, c: r.cinema, d: r.date, t: r.time, v: r.version,
    st: det?.status || '', b: det?.sid ? bookUrl(cc, det.sid) : (m.vsId ? filmUrl(m.vsId) : ''), s: det?.sid ? seatUrl(cc, det.sid) : ''
  });
}
// 電影頁有、但週場次表沒有的（保險）
for (const [k, list] of vsIndex) for (const det of list) {
  if (usedDetail.has(det)) continue;
  const [cinema, date, time, mk] = k.split('|');
  const cc = VS[cinema].cinemacode;
  sessions.push({ m: mk, c: cinema, d: date, t: time, v: det.version.replace(/\s*\/\s*/, ' ').replace(/\bGC\b/, 'Gold Class'), st: det.status, b: bookUrl(cc, det.sid), s: seatUrl(cc, det.sid) });
}

for (const s of bw.sessions) {
  const m = movieOf(s.title, { en: s.en, rating: s.rating, runtime: s.runtime, release: s.release, poster: s.poster, bwPid: s.pid });
  sessions.push({
    m: m.key, c: 'shown', d: s.date, t: s.time, v: [s.version, s.hallname].filter(Boolean).join(' '),
    st: s.disabled ? 'closed' : (s.total && s.free === 0 ? 'soldout' : (s.total && s.free / s.total < 0.15 ? 'few' : '')),
    fr: s.free, to: s.total, b: bwBook(s.pid), s: bwSeat(s)
  });
}

// ---------- IMDb ----------
for (const m of movies.values()) {
  m.hint = atHint[m.key] || '';
  try { m.imdb = await resolveImdb(m, imdbCache, log); } catch (e) { log(`IMDb ${m.title}：${e.message}`); m.imdb = { id: '' }; }
}
let ratings = {};
try { ratings = await loadRatings([...movies.values()].map(m => m.imdb?.id).filter(Boolean), log); }
catch (e) { errors.push(`IMDb 評分：${e.message}`); ratings = Object.fromEntries(Object.values(previous.movies || {}).filter(m => m.imdb?.id && m.imdb.r).map(m => [m.imdb.id, { r: m.imdb.r, v: m.imdb.v }])); }

// 同一個 IMDb 編號的不同中文片名合併成一部
const finalKey = new Map();
const outMovies = {};
for (const m of movies.values()) {
  const id = m.imdb?.id || '';
  const slug = id || 'n' + [...m.key].reduce((h, ch) => (h * 31 + ch.codePointAt(0)) >>> 0, 7).toString(36);
  finalKey.set(m.key, slug);
  const en = /[a-z]/.test(m.en) ? m.en : m.en.toLowerCase().replace(/(^|[\s:\-(])([a-z])/g, (x, a, b) => a + b.toUpperCase());
  const o = outMovies[slug] || (outMovies[slug] = { title: m.title, en, rating: m.rating, runtime: m.runtime, release: m.release, vs: m.vsId, bw: m.bwPid, imdb: id ? { id, r: ratings[id]?.r || 0, v: ratings[id]?.v || 0 } : null, _zh: [], _imdbImg: '' });
  if (!o.en && en) o.en = en;
  for (const f of ['rating', 'runtime', 'release']) if (!o[f] && m[f]) o[f] = m[f];
  if (!o.vs && m.vsId) o.vs = m.vsId;
  if (!o.bw && m.bwPid) o.bw = m.bwPid;
  o._zh.push(...m.zhPosters);
  if (m.imdb?.image) o._imdbImg = m.imdb.image;
}

// ---------- 海報 ----------
for (const [slug, o] of Object.entries(outMovies)) {
  try {
    const rec = await savePosters(root, slug, { zh: o._zh, imdb: o._imdbImg }, posterManifest, log);
    o.poster = { thumb: rec.thumb || '', zh: rec.zh?.file || '', zhSize: rec.zh ? `${rec.zh.w}×${rec.zh.h}` : '', hd: rec.imdb?.file || '', hdSize: rec.imdb ? `${rec.imdb.w}×${rec.imdb.h}` : '' };
  } catch (e) { log(`海報 ${o.title}：${e.message}`); o.poster = {}; }
  delete o._zh; delete o._imdbImg;
}

// ---------- 輸出 ----------
const outSessions = sessions
  .filter(s => s.d >= today && s.d <= lastDay)
  .map(s => ({ ...s, m: finalKey.get(s.m) || s.m }))
  .sort((a, b) => a.d.localeCompare(b.d) || a.t.localeCompare(b.t) || a.c.localeCompare(b.c));
// 去重（同影城同時間同片同版本）
const seen = new Set();
const dedup = outSessions.filter(s => { const k = [s.m, s.c, s.d, s.t, s.v].join('|'); if (seen.has(k)) return false; seen.add(k); return true; });
for (const k of Object.keys(outMovies)) if (!dedup.some(s => s.m === k)) delete outMovies[k];

if (!dedup.length) { console.error('沒有任何場次，不更新檔案'); process.exit(1); }
const out = { v: 2, generated: new Date().toISOString(), today, errors, movies: outMovies, sessions: dedup };
await mkdir(new URL('data/', root), { recursive: true });
await writeFile(new URL('data/showtimes.json', root), JSON.stringify(out) + '\n');
await writeFile(new URL('data/imdb-cache.json', root), JSON.stringify(imdbCache, null, 1) + '\n');
await writeFile(new URL('data/posters.json', root), JSON.stringify(posterManifest, null, 1) + '\n');
await writeFile(new URL('data/last-run.log', root), logs.join('\n') + '\n');
log(`完成：${Object.keys(outMovies).length} 部、${dedup.length} 場`);
