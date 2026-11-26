// 百老匯影城竹北店（享平方）：片單、每天場次、免登入座位預覽
import { getJSON, pool, RATING } from './util.mjs';

const BW = 'https://www.broadway-cineplex.com.tw/';
const SITE = 'Zhubei';

export async function broadway({ seatDays, today, log }) {
  const list = await getJSON(BW + `Movie/GetMovieList/${SITE}`);
  if (!list.status) throw new Error('百老匯片單回傳失敗');
  const movies = (list.Data || []).filter(m => m.programid);
  const jobs = [];
  for (const m of movies) for (const d of m.datedata || []) jobs.push({ m, date: d.date });
  const days = await pool(jobs, 4, async ({ m, date }) => {
    const r = await getJSON(BW + `Movie/GetMovieAlltime/${SITE}/${m.programid}/${date}`);
    return (r.Data || []).flatMap(g => g.subtimedata || []).map(s => ({ m, s }));
  });
  const sessions = [];
  for (const d of days) if (Array.isArray(d)) for (const { m, s } of d) {
    sessions.push({
      pid: m.programid, title: m.cname, en: m.ename || '', rating: RATING[m.CodeName] ?? '', runtime: +m.ShowTimes || 0,
      release: (m.ReleaseDate || '').slice(0, 10), poster: m.image || '',
      date: s.showdate, time: s['時間'], version: (s.SubName2 || '').replace('/', ' '), hall: s.hall, hallname: s.hallname, disabled: !!s.disable
    });
  }
  // 座位：只算接下來幾天的場次，免得每小時打太多請求
  const lastSeatDay = new Date(new Date(today + 'T12:00:00Z').getTime() + seatDays * 864e5).toISOString().slice(0, 10);
  const kinds = {};
  const targets = sessions.filter(s => !s.disabled && s.date <= lastSeatDay);
  await pool(targets, 4, async s => {
    const r = await getJSON(BW + `Movie/GetSeatView/${SITE}/${s.pid}/${s.date}/${s.time.replace(':', '-')}/${s.hall}`);
    let free = 0, sold = 0, wheel = 0;
    for (const row of r.Data || []) for (const c of row.cols || []) {
      const k = `${c.seatkind}/${c.choice}`; kinds[k] = (kinds[k] || 0) + 1;
      if (c.seatkind === '+' ) continue;                 // 走道、空格
      if (!c.col && !c.colname) continue;
      if (c.choice === 'Y' || !['0', '1', '-'].includes(c.seatkind)) sold++;
      else if (c.seatkind === '1') wheel++;
      else free++;
    }
    s.free = free; s.total = free + sold + wheel;
  });
  log(`百老匯：${movies.length} 部、${sessions.length} 場，算了 ${targets.length} 場座位；座位代碼統計 ${JSON.stringify(kinds)}`);
  return { sessions, seatKinds: kinds };
}

export const bwBook = pid => `${BW}book.html?obj=${SITE}&pid=${pid}`;
export const bwSeat = s => `${BW}quick-view.html?obj=${SITE},${s.pid},${s.date},${s.time.replace(':', '-')},${s.hall}`;
