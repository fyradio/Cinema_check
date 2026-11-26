// 由 GitHub Actions 定時執行：抓開眼電影網三家影城的今日場次 → data/showtimes.json
// 本機也可以跑：node scripts/scrape.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parse } = require('../parser.js');
const root = new URL('../', import.meta.url);
const theaters = JSON.parse(await readFile(new URL('theaters.json', root), 'utf8'));
const outFile = new URL('data/showtimes.json', root);

let previous = { theaters: {} };
try { previous = JSON.parse(await readFile(outFile, 'utf8')); } catch {}

async function grab(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (hsinchu-movies showtime checker)',
          'Accept-Language': 'zh-TW,zh;q=0.9'
        },
        signal: AbortSignal.timeout(20000)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.text();
    } catch (e) {
      console.warn(`第 ${attempt} 次失敗 ${url}: ${e.message}`);
      if (attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 3000 * attempt));
    }
  }
}

const out = { generated: new Date().toISOString(), source: 'atmovies', theaters: {} };
let ok = 0, changed = false;
for (const t of theaters) {
  const url = `https://www.atmovies.com.tw/showtime/${t.code}/a35/`;
  try {
    const data = parse(await grab(url));
    if (!data.movies.length) throw new Error('沒有解析到任何場次');
    const old = previous.theaters?.[t.key];
    const same = old && JSON.stringify([old.date, old.updated, old.movies]) === JSON.stringify([data.date, data.updated, data.movies]);
    // 內容沒變就保留舊的時間戳，避免每小時產生空的 commit
    out.theaters[t.key] = same ? old : { ...data, fetched: out.generated };
    if (!same) changed = true;
    ok++;
    console.log(`${t.name}: ${data.date} 共 ${data.movies.length} 筆`);
  } catch (e) {
    console.error(`${t.name} 抓取失敗：${e.message}`);
    if (previous.theaters?.[t.key]) out.theaters[t.key] = previous.theaters[t.key];
  }
}

if (!ok) {
  console.error('三家都失敗，不更新檔案');
  process.exit(1);
}
if (!changed && previous.generated) out.generated = previous.generated;
await mkdir(new URL('data/', root), { recursive: true });
await writeFile(outFile, JSON.stringify(out, null, 1) + '\n');
console.log('已寫入 data/showtimes.json');
