# 新竹電影場次

一頁看完新竹三家影城未來一週的場次、IMDb 評分、剩餘座位與訂票連結：

- 新竹大遠百威秀影城（含 Gold Class）
- 新竹巨城威秀影城
- 享平方 百老匯影城竹北店

網址：https://fyradio.github.io/Cinema_check/

## 資料從哪來

GitHub Actions（`.github/workflows/update.yml`）在台灣時間 07:17～23:17 每小時跑一次 `scripts/scrape.mjs`：

| 來源 | 拿什麼 | 怎麼抓 |
|---|---|---|
| 威秀 `ShowTimes/GetShowTimes`（HS、HSGC、BC） | 一週場次、中英文片名、分級 | 一般 POST |
| 威秀電影頁 `film/detail.aspx?id=…` | 每一場的訂票連結、座位圖連結、快售完／完售（底色）、海報、片長 | 有防爬蟲，用真的 Chrome（playwright-core）開 |
| 百老匯 `Movie/GetMovieList`、`GetMovieAlltime` | 竹北店一週場次、海報 | JSON |
| 百老匯 `Movie/GetSeatView` | 未來兩天每場的空位數（`0` 空位、`1` 已售） | JSON |
| IMDb 搜尋建議 API ＋ 開眼電影代碼 | IMDb 編號 | 英文片名搜尋；開眼的電影代碼就是 IMDb 編號，用來確認 |
| IMDb 官方資料檔 `title.ratings.tsv.gz` | 評分與票數 | 每次下載 |

產出：

- `data/showtimes.json`：網頁讀的資料（電影＋場次）
- `posters/full/`：海報原圖（`-zh` 影城的中文海報、`-imdb` IMDb 原版高畫質）
- `posters/thumb/`：列表用的小縮圖（360px webp）
- `data/imdb-cache.json`、`data/posters.json`：快取，避免重複查詢、重複下載
- `data/last-run.log`：最後一次執行的紀錄

## 手動更新

GitHub 上：Actions → 更新場次 → Run workflow。

## 限制

- 威秀官網只標示「即將售完／完售」，沒有確切空位數；確切座位要點「看座位圖」。
- 百老匯的訂票頁要登入，而且要在頁面上再選一次場次。
- 威秀新場次通常週三中午公布到下週四，所以有時候只看得到幾天。
- 場次、座位、票價以影城為準。

`parser.js` 是開眼電影網的解析器（現在只用來拿 IMDb 編號提示）。
