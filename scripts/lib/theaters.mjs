// 所有影城的設定：地區、顏色、資料來源。網頁也從 data/showtimes.json 讀這份清單。
// source:
//   vieshow  — 威秀官網：一週場次＋訂票＋快售完/完售（codes＝GetShowTimes 代碼，theaterIds＝電影頁影城編號，cinemacode＝訂票代碼）
//   broadway — 百老匯官網：一週場次＋剩餘座位
//   atmovies — 開眼電影網：只有當天場次（at＝開眼戲院代碼）
export const REGIONS = [
  { key: 'hsinchu', name: '新竹' },
  { key: 'toufen', name: '頭份' },
  { key: 'taoyuan', name: '桃園' }
];

export const THEATERS = [
  { key: 'fe21', region: 'hsinchu', name: '新竹大遠百威秀影城', short: '大遠百威秀', color: '#0e8a8c', source: 'vieshow', codes: { HS: '', HSGC: 'Gold Class' }, theaterIds: ['7', '8'], cinemacode: '2', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=7' },
  { key: 'bigcity', region: 'hsinchu', name: '新竹巨城威秀影城', short: '巨城威秀', color: '#7048a8', source: 'vieshow', codes: { BC: '' }, theaterIds: ['9'], cinemacode: '14', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=9' },
  { key: 'shown', region: 'hsinchu', name: '享平方 百老匯影城竹北店', short: '享平方百老匯', color: '#d9661a', source: 'broadway', official: 'https://www.broadway-cineplex.com.tw/book.html?obj=Zhubei' },

  { key: 'toufen', region: 'toufen', name: '頭份尚順威秀影城', short: '頭份尚順威秀', color: '#2e7d32', source: 'vieshow', codes: { TF: '' }, theaterIds: ['10'], cinemacode: '18', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=10' },

  { key: 'tonlin', region: 'taoyuan', name: '桃園統領威秀影城', short: '統領威秀', color: '#1565c0', source: 'vieshow', codes: { TY: '' }, theaterIds: ['20'], cinemacode: '20', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=20' },
  { key: 'geleven', region: 'taoyuan', name: '桃園桃知道威秀影城', short: '桃知道威秀', color: '#c2185b', source: 'vieshow', codes: { TG: '' }, theaterIds: ['29'], cinemacode: '33', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=29' },
  { key: 'miranew', region: 'taoyuan', name: '美麗新台茂影城', short: '美麗新台茂', color: '#6d4c41', source: 'atmovies', at: 't03301', official: 'https://www.miranewcinemas.com.tw/' },
  { key: 'sbc', region: 'taoyuan', name: '星橋國際影城（中壢）', short: '中壢星橋', color: '#00838f', source: 'atmovies', at: 't03302', official: 'https://www.sbcmovies.com.tw/browsing/' },
  { key: 'venice', region: 'taoyuan', name: '威尼斯影城（中壢）', short: '中壢威尼斯', color: '#5d4037', source: 'atmovies', at: 't03303', official: 'http://www.venice-cinemas.com.tw/showtime.php' },
  { key: 'ambbade', region: 'taoyuan', name: '國賓影城 桃園八德', short: '國賓八德', color: '#ad1457', source: 'atmovies', at: 't03304', official: 'https://www.ambassador.com.tw/home' },
  { key: 'in89', region: 'taoyuan', name: '桃園站前 in89 豪華影城', short: 'in89 桃園', color: '#283593', source: 'atmovies', at: 't03307', official: 'https://www.in89.com.tw/film_list.aspx?TheaterId=1' },
  { key: 'skty', region: 'taoyuan', name: '桃園新光影城（中壢）', short: '新光影城', color: '#d84315', source: 'atmovies', at: 't03315', official: 'https://www.skcinemas.com/sessions' },
  { key: 'tyarts', region: 'taoyuan', name: '桃園光影文化館', short: '桃園光影', color: '#558b2f', source: 'atmovies', at: 't03311', official: 'https://www.facebook.com/taoyuanartscinema2/' },
  { key: 'zlarts', region: 'taoyuan', name: '中壢光影電影館', short: '中壢光影', color: '#827717', source: 'atmovies', at: 't03312', official: 'https://www.facebook.com/TaoyuanArtsCinema/' }
];

// 給網頁的公開欄位
export const publicTheaters = () => THEATERS.map(({ key, region, name, short, color, source, official }) => ({ key, region, name, short, color, source, official }));
