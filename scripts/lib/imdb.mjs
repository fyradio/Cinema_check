// IMDb：用英文片名查 IMDb 編號（官方搜尋建議 API），評分用 IMDb 官方每日資料檔 title.ratings.tsv.gz
import { createGunzip } from 'node:zlib';
import { Readable } from 'node:stream';
import { createInterface } from 'node:readline';
import { get, getJSON, sleep } from './util.mjs';

const MOVIEISH = new Set(['movie', 'tvMovie', 'video', 'short', 'tvSpecial']);
const simplify = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();

export async function resolveImdb(movie, cache, log) {
  const ck = movie.key;
  const hit = cache[ck];
  // 找到過就沿用；沒找到的一天後再試
  if (hit && (hit.id || Date.now() - (hit.checked || 0) < 864e5)) return hit;
  const en = String(movie.en || '').replace(/^disney'?s\s+/i, '');
  const queries = [...new Set([movie.en, en, en.replace(/\s*[:\-–].*$/, '')].filter(q => q && q.length > 1))];
  let best = null;
  for (const q of queries) {
    let res;
    try {
      const qq = simplify(q).slice(0, 60);
      if (!qq) continue;
      res = await getJSON(`https://v3.sg.media-imdb.com/suggestion/${qq[0]}/${encodeURIComponent(qq)}.json`, {}, 2);
    } catch (e) { log(`IMDb 搜尋「${q}」失敗：${e.message}`); continue; }
    await sleep(300);
    const year = +String(movie.release || '').slice(0, 4) || 0;
    for (const [i, c] of (res.d || []).entries()) {
      if (!/^tt\d+$/.test(c.id) || (c.qid && !MOVIEISH.has(c.qid))) continue;
      let score = 10 - i;
      if (movie.hint && c.id === movie.hint) score += 100;
      if (simplify(c.l) === simplify(movie.en)) score += 20;
      else if (simplify(c.l) === simplify(q)) score += 12;
      if (year && c.y) { const dy = Math.abs(c.y - year); score += dy <= 1 ? 15 : dy <= 3 ? 3 : 0; }
      if (!best || score > best.score) best = { score, id: c.id, title: c.l, year: c.y || 0, image: c.i?.imageUrl || '' };
    }
    if (best && best.score >= 30) break;
  }
  // 英文片名查不到時，用開眼給的編號（開眼的電影代碼就是 IMDb 編號）向 IMDb 確認
  if ((!best || best.score < 15) && movie.hint) {
    try {
      const r = await getJSON(`https://v3.sg.media-imdb.com/suggestion/t/${movie.hint}.json`, {}, 2);
      const c = (r.d || []).find(x => x.id === movie.hint);
      if (c) best = { score: 50, id: c.id, title: c.l, year: c.y || 0, image: c.i?.imageUrl || '' };
    } catch (e) { log(`IMDb 確認 ${movie.hint} 失敗：${e.message}`); }
  }
  const rec = best && best.score >= 15 ? { id: best.id, title: best.title, year: best.year, image: best.image, checked: Date.now() } : { id: '', checked: Date.now() };
  cache[ck] = rec;
  return rec;
}

export async function loadRatings(ids, log) {
  const want = new Set(ids);
  const out = {};
  if (!want.size) return out;
  const r = await get('https://datasets.imdbws.com/title.ratings.tsv.gz', { timeout: 120000 });
  const rl = createInterface({ input: Readable.fromWeb(r.body).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const line of rl) {
    const tab = line.indexOf('\t');
    const id = line.slice(0, tab);
    if (want.has(id)) { const [, avg, votes] = line.split('\t'); out[id] = { r: +avg, v: +votes }; }
  }
  log(`IMDb 評分：${Object.keys(out).length}/${want.size} 部有分數`);
  return out;
}
