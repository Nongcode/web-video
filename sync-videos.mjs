// Chép các file .mp4 từ thư mục out sang public/videos và sinh data/videos.json
import { cpSync, mkdirSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SRC = process.argv[2] ?? "D:/HRM-DNS-TPE/tools/video-huong-dan/out";
mkdirSync("public/videos", { recursive: true });
mkdirSync("data", { recursive: true });
const list = [];
// Chỉ lấy video thuộc danh mục xe và danh mục chung (các video khác đã duyệt, không đưa lên nữa)
const KEEP = /^huong-dan-danh-muc-(xe|doi-xe|dong-xe|hang-xe|loai-xe|model-xe|tai-trong-xe|bien-so-xe|nhien-lieu|lai-xe-ngoai|chuong|muc|tieu-muc|ngan-hang|linh-vuc-cong-ty-kinh-doanh)$/;
for (const d of readdirSync(SRC)) {
  if (!KEEP.test(d)) continue;
  const f = join(SRC, d, `${d}.mp4`);
  if (!existsSync(f)) continue;
  const s = statSync(f);
  cpSync(f, join("public/videos", `${d}.mp4`));
  list.push({ id: d, title: d.replace(/^huong-dan-/, "").replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()), size: s.size, mtime: s.mtimeMs });
}
list.sort((a, b) => b.mtime - a.mtime);
writeFileSync("data/videos.json", JSON.stringify(list, null, 2));
console.log(list.length, "video");
