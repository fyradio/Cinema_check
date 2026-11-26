# 新竹電影場次

一頁看完新竹三家影城的今日場次：

- 新竹大遠百威秀影城
- 新竹巨城威秀影城
- 享平方 百老匯影城竹北店

網址：https://fyradio.github.io/Cinema_check/

## 怎麼運作

1. GitHub Actions（`.github/workflows/update.yml`）在台灣時間 07:17～23:17 每小時跑一次 `scripts/scrape.mjs`，
   到開眼電影網抓三家的當日場次，存成 `data/showtimes.json`（內容有變才 commit）。
2. 網頁 `index.html` 打開時讀 `data/showtimes.json`。如果資料不是今天的，或按「重新抓取」，
   會改用公開的 CORS 代理即時去開眼抓。
3. `parser.js` 是解析器，網頁和抓取腳本共用。它不看網頁的 class，只看內容順序
   （片名連結 → 分級圖 → 片長 → 版本 → 時間 → 「其他戲院」），開眼改版面時比較不容易壞。

## 手動更新

- GitHub 上：Actions → 更新場次 → Run workflow
- 本機：`node scripts/scrape.mjs`（需要 Node 18 以上）

## 新增影城

在 `theaters.json` 和 `index.html` 裡的 `THEATERS` 各加一筆；`code` 是開眼戲院網址裡的代碼
（例如 `https://www.atmovies.com.tw/showtime/t03508/a35/` 的 `t03508`）。

## 限制

- 開眼只提供當天場次，明天以後請到影城官網查。
- 場次與訂票以影城官網為準。
