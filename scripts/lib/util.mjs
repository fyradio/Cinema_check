export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export function decode(s) {
  return String(s || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

export const clean = s => decode(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// 片名正規化：給跨影城比對用
export const norm = s => String(s || '')
  .replace(/劇場版|電影版/g, '')
  .replace(/[《》「」『』〈〉（）()【】\[\]\s:：!！?？.,，、·・\-－—～~'’"“”&＆]/g, '')
  .toLowerCase();

export async function get(url, opts = {}, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { ...opts, headers: { 'User-Agent': UA, 'Accept-Language': 'zh-TW,zh;q=0.9', ...(opts.headers || {}) }, signal: AbortSignal.timeout(opts.timeout || 25000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r;
    } catch (e) {
      if (i >= tries) throw new Error(`${url}: ${e.message}`);
      await sleep(1500 * i);
    }
  }
}
export const getText = async (u, o) => (await get(u, o)).text();
export const getJSON = async (u, o) => (await get(u, o)).json();
export const sleep = ms => new Promise(r => setTimeout(r, ms));

// 簡單的並行上限
export async function pool(items, n, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; try { out[k] = await fn(items[k], k); } catch (e) { out[k] = { error: e.message }; } }
  }));
  return out;
}

export function taipeiToday() {
  const p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).forEach(x => p[x.type] = x.value);
  return `${p.year}-${p.month}-${p.day}`;
}
export const addDays = (d, n) => { const t = new Date(d + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };

// 「11月27日」或「11/27」這種沒有年份的日期，用今天推算年份
export function mdToDate(m, d, today) {
  const y = +today.slice(0, 4), tm = +today.slice(5, 7);
  let yy = y;
  if (m < tm - 6) yy = y + 1; else if (m > tm + 6) yy = y - 1;
  return `${yy}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export const RATING = { '普遍級': '普', '保護級': '護', '輔12級': '輔12', '輔15級': '輔15', '限制級': '限', '待定': '' , '普遍': '普', '保護': '護', '輔12': '輔12', '輔15': '輔15', '限制': '限' };
