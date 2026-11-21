# Web video HDSD

Next.js trên Vercel. Video và chỉ mục nằm trong Vercel Blob (store public):
- `videos/<id>.<ext>`: file video
- `index/videos.json`: danh sách video (tiêu đề, danh mục, đường dẫn)
- `comments/<id>.json`: góp ý của từng video

Danh mục cố định trong `lib/categories.ts`.

## Thiết lập lần đầu
1. Vercel → Storage → Blob (Public) → Connect Project.
2. Settings → Environment Variables: `ADMIN_PASSWORD`.
3. Redeploy.
4. Chuyển video cũ lên Blob (chạy một lần, cần token Blob ở máy):
   `vercel env pull .env.local`, rồi `node --env-file=.env.local scripts/migrate-videos.mjs`

## Quản trị video
Vào `/admin`, nhập `ADMIN_PASSWORD`:
- **Thêm:** nhập tiêu đề, chọn danh mục, chọn file → Tải lên.
- **Sửa:** đổi tiêu đề hoặc danh mục trong dòng video → Lưu.
- **Xoá:** Xoá video, kèm file và góp ý của nó.

## Chạy local
`npm install` rồi `npm run dev` (cần `.env.local` có token Blob để xem dữ liệu thật).
