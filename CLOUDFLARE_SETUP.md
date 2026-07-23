# Jane Travel Map：Cloudflare 搬站設定

此版本使用 Cloudflare Workers、D1 與 Google OpenID Connect。

## 部署前設定

1. 在 Cloudflare 建立 D1 資料庫 `janetravelmap-db`。
2. 把 `wrangler.jsonc` 內的 `REPLACE_WITH_D1_DATABASE_ID` 換成實際 D1 ID。
3. 在 Google Cloud 建立「網頁應用程式」OAuth 用戶端。
4. 設定正式回呼網址：
   `https://janetravelmap.com/auth/google/callback`
5. 在 Cloudflare Worker 設定：
   - 一般變數 `GOOGLE_CLIENT_ID`
   - 加密變數 `GOOGLE_CLIENT_SECRET`
6. 執行 D1 migrations，再部署 Worker。

## 注意

- 不要把 Google Client Secret 放進 GitHub。
- 不要把管理員匯出的使用者與旅行備份放進 GitHub。
- 搬移完成並驗證資料前，保留原本的 ChatGPT Sites 網站。
