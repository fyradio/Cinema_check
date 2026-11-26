// 海報：下載原圖存進儲存庫（posters/full），另外做一張小縮圖給網頁列表用（posters/thumb）
import { mkdir, writeFile, access } from 'node:fs/promises';
import sharp from 'sharp';
import { get } from './util.mjs';

const MAX_BYTES = 4 * 1024 * 1024;   // 原圖超過 4MB 才縮到長邊 3000px（仍是高畫質）

async function exists(p) { try { await access(p); return true; } catch { return false; } }

async function fetchImage(url) {
  const r = await get(url, { timeout: 60000 }, 2);
  const buf = Buffer.from(await r.arrayBuffer());
  const meta = await sharp(buf).metadata();
  if (!meta.width) throw new Error('不是圖片');
  return { buf, meta };
}

// 給一部電影存兩種：中文海報（影城官網）＋ IMDb 原版（通常解析度最高）
export async function savePosters(root, slug, { zh = [], imdb = '' }, manifest, log) {
  const rec = manifest[slug] || {};
  const jobs = [];
  if (!rec.zh && zh.length) jobs.push(['zh', zh]);
  if (!rec.imdb && imdb) jobs.push(['imdb', [imdb]]);
  for (const [kind, urls] of jobs) {
    let best = null;
    for (const u of urls) {
      try { const img = await fetchImage(u); if (!best || img.meta.width > best.meta.width) best = { ...img, src: u }; }
      catch (e) { log(`海報下載失敗 ${u}：${e.message}`); }
    }
    if (!best) continue;
    let { buf, meta } = best;
    if (buf.length > MAX_BYTES) { buf = await sharp(buf).resize({ width: 3000, height: 3000, fit: 'inside' }).jpeg({ quality: 92 }).toBuffer(); meta = await sharp(buf).metadata(); }
    const ext = meta.format === 'png' ? 'png' : meta.format === 'webp' ? 'webp' : 'jpg';
    const full = `posters/full/${slug}-${kind}.${ext}`;
    await mkdir(new URL('posters/full/', root), { recursive: true });
    await writeFile(new URL(full, root), buf);
    rec[kind] = { file: full, w: meta.width, h: meta.height, bytes: buf.length, src: best.src };
  }
  const thumbSrc = rec.zh || rec.imdb;
  const thumb = `posters/thumb/${slug}.webp`;
  if (thumbSrc && (!rec.thumb || rec.thumbFrom !== thumbSrc.file || !(await exists(new URL(thumb, root))))) {
    await mkdir(new URL('posters/thumb/', root), { recursive: true });
    await sharp(new URL(thumbSrc.file, root).pathname).resize({ width: 360 }).webp({ quality: 80 }).toFile(new URL(thumb, root).pathname);
    rec.thumb = thumb; rec.thumbFrom = thumbSrc.file;
  }
  manifest[slug] = rec;
  return rec;
}
