# Web video HDSD

Next.js. Video nằm ở `public/videos`, danh sách ở `data/videos.json`, danh mục ở `lib/categories.ts`.
Góp ý theo mốc thời gian lưu chung bằng Vercel Blob (`app/api/comments/route.ts`, file `comments/<id>.json`).

## Deploy
1. Đẩy repo lên GitHub, import vào Vercel (Root Directory `web-video`).
2. Project → Storage → Create Database → **Blob** (chọn Public) → Connect Project. Vercel tự thêm `BLOB_READ_WRITE_TOKEN`.
3. Settings → Environment Variables: thêm `ADMIN_PASSWORD` (mật khẩu để xoá góp ý).
4. Redeploy.

## Cập nhật video
`node sync-videos.mjs [thư-mục-out]` (mặc định `D:/HRM-DNS-TPE/tools/video-huong-dan/out`), commit + push.

## Chạy local
`vercel link && vercel env pull .env.local`, rồi `npm run dev`. Không có token thì góp ý báo lỗi, phần còn lại vẫn chạy.
