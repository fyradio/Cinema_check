// 所有影城的設定：地區、顏色、資料來源。網頁也從 data/showtimes.json 讀這份清單。
// source:
//   vieshow  — 威秀官網：一週場次＋訂票＋快售完/完售（codes＝GetShowTimes 代碼，theaterIds＝電影頁影城編號，cinemacode＝訂票代碼）
//   broadway — 百老匯官網：一週場次＋剩餘座位
//   （新竹以外只收威秀；開眼只用來提供 IMDb 編號提示）
export const REGIONS = [  // 由北到南
  { key: 'taipei', name: '雙北' },
  { key: 'taoyuan', name: '桃園' },
  { key: 'hsinchu', name: '新竹' },
  { key: 'toufen', name: '頭份' },
  { key: 'kaohsiung', name: '高雄' }
];
// 合併檢視：一次載入幾個地區
export const GROUPS = [
  { key: 'tzm', name: '桃竹苗全部', regions: ['taoyuan', 'hsinchu', 'toufen'] }
];

export const THEATERS = [
  // 由北到南排列（網頁顯示順序依此）
  { key: 'vslk', region: 'taipei', name: '林口 MITSUI OUTLET PARK 威秀影城', short: '林口三井威秀', color: '#283593', source: 'vieshow', codes: { LK: '' }, theaterIds: ['5'], cinemacode: '19', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=5' },
  { key: 'vsnl', region: 'taipei', name: '台北南港 LaLaport 威秀影城', short: '南港 LaLaport 威秀', color: '#00838f', source: 'vieshow', codes: { NL: '' }, theaterIds: ['34'], cinemacode: '35', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=34' },
  { key: 'vsqs', region: 'taipei', name: '台北京站威秀影城', short: '京站威秀', color: '#c2185b', source: 'vieshow', codes: { QS: '' }, theaterIds: ['2'], cinemacode: '12', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=2' },
  { key: 'vstx', region: 'taipei', name: '台北西門威秀影城', short: '西門威秀', color: '#d84315', source: 'vieshow', codes: { TX: '' }, theaterIds: ['31'], cinemacode: '34', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=31' },
  { key: 'muvie', region: 'taipei', name: 'MUVIE CINEMAS 台北松仁', short: 'MUVIE 松仁', color: '#6a1b9a', source: 'vieshow', codes: { MU: '', MUC: 'MUCROWN' }, theaterIds: ['23', '24'], cinemacode: '21', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=23' },
  { key: 'vstp', region: 'taipei', name: '台北信義威秀影城', short: '信義威秀', color: '#1565c0', source: 'vieshow', codes: { TP: '' }, theaterIds: ['1'], cinemacode: '1', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=1' },
  { key: 'vsbq', region: 'taipei', name: '板橋大遠百威秀影城', short: '板橋大遠百威秀', color: '#2e7d32', source: 'vieshow', codes: { BQ: '' }, theaterIds: ['4'], cinemacode: '16', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=4' },
  { key: 'vsgm', region: 'taipei', name: '中和環球威秀影城', short: '中和環球威秀', color: '#5d4037', source: 'vieshow', codes: { GM: '' }, theaterIds: ['25'], cinemacode: '30', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=25' },
  { key: 'vshu', region: 'taipei', name: '新店裕隆城威秀影城', short: '新店裕隆城威秀', color: '#ad1457', source: 'vieshow', codes: { HU: '' }, theaterIds: ['28'], cinemacode: '32', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=28' },
  { key: 'tonlin', region: 'taoyuan', name: '桃園統領威秀影城', short: '統領威秀', color: '#1565c0', source: 'vieshow', codes: { TY: '' }, theaterIds: ['20'], cinemacode: '20', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=20' },
  { key: 'geleven', region: 'taoyuan', name: '桃園桃知道威秀影城', short: '桃知道威秀', color: '#c2185b', source: 'vieshow', codes: { TG: '' }, theaterIds: ['29'], cinemacode: '33', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=29' },
  { key: 'shown', region: 'hsinchu', name: '享平方 百老匯影城竹北店', short: '享平方百老匯', color: '#d9661a', source: 'broadway', official: 'https://www.broadway-cineplex.com.tw/book.html?obj=Zhubei' },
  { key: 'bigcity', region: 'hsinchu', name: '新竹巨城威秀影城', short: '巨城威秀', color: '#7048a8', source: 'vieshow', codes: { BC: '' }, theaterIds: ['9'], cinemacode: '14', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=9' },
  { key: 'fe21', region: 'hsinchu', name: '新竹大遠百威秀影城', short: '大遠百威秀', color: '#0e8a8c', source: 'vieshow', codes: { HS: '', HSGC: 'Gold Class' }, theaterIds: ['7', '8'], cinemacode: '2', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=7' },
  { key: 'toufen', region: 'toufen', name: '頭份尚順威秀影城', short: '頭份尚順威秀', color: '#2e7d32', source: 'vieshow', codes: { TF: '' }, theaterIds: ['10'], cinemacode: '18', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=10' },
  { key: 'vsks', region: 'kaohsiung', name: '高雄大遠百威秀影城', short: '高雄大遠百威秀', color: '#0e8a8c', source: 'vieshow', codes: { KS: '', KSGC: 'Gold Class' }, theaterIds: ['18', '19'], cinemacode: '6', official: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=18' }
];

// 給網頁的公開欄位
export const publicTheaters = () => THEATERS.map(({ key, region, name, short, color, source, official }) => ({ key, region, name, short, color, source, official }));
