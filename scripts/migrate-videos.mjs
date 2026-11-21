// Đưa 18 video cũ từ thư mục out lên Vercel Blob và ghi chỉ mục. Chạy một lần:
//   BLOB_READ_WRITE_TOKEN=<token> node scripts/migrate-videos.mjs
// Giữ nguyên id (tên thư mục) để góp ý cũ vẫn gắn đúng video.
import { put } from "@vercel/blob";
import { readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const SRC = process.argv[2] ?? "D:/HRM-DNS-TPE/tools/video-huong-dan/out";
const old = JSON.parse(readFileSync("data/videos.json", "utf8"));
const dm = (xs) => xs.map((s) => `huong-dan-danh-muc-${s}`);
const CAT = Object.fromEntries([
  ...dm(["xe", "doi-xe", "dong-xe", "hang-xe", "loai-xe", "model-xe", "tai-trong-xe", "bien-so-xe", "nhien-lieu", "lai-xe-ngoai"]).map((id) => [id, "xe"]),
  ...dm(["chuong", "muc", "tieu-muc", "ngan-hang", "linh-vuc-cong-ty-kinh-doanh"]).map((id) => [id, "chung"]),
  ["cai-dat-ung-dung", "app-dien-thoai"],
  ["huong-dan-phan-chia-thi-truong-theo-nhan-vien", "phan-chia-thi-truong"],
  ["huong-dan-phan-chia-thi-truong-theo-phong-ban", "phan-chia-thi-truong"],
]);

const videos = [];
for (const v of old) {
  const file = join(SRC, v.id, `${v.id}.mp4`).replace(/\/g, "/");
  if (!existsSync(file)) { console.warn("Thiếu file", file); continue; }
  const blob = await put(`videos/${v.id}.mp4`, readFileSync(file), {
    access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "video/mp4",
  });
  videos.push({ id: v.id, title: v.title, category: CAT[v.id], url: blob.url, size: statSync(file).size, uploadedAt: new Date(statSync(file).mtimeMs).toISOString() });
  console.log("OK", v.id);
}
await put("index/videos.json", JSON.stringify(videos), {
  access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 0,
});
console.log(`Xong: ${videos.length} video`);
