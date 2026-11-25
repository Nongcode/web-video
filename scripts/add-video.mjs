// Thêm một video mới lên Blob và ghi vào chỉ mục (không cần qua trang quản trị).
//   node --env-file=.env.local scripts/add-video.mjs <file.mp4> "<tiêu đề>" <slug-danh-mục>
import { put, list } from "@vercel/blob";
import { readFileSync, statSync } from "node:fs";
import { basename, extname } from "node:path";

const [file, title, category] = process.argv.slice(2);
if (!file || !title || !category) throw new Error('Cần: <file> "<tiêu đề>" <danh-mục>');

const slugify = (s) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const id = slugify(title);
const INDEX = "index/videos.json";

const { blobs } = await list({ prefix: INDEX, limit: 1 });
const idx = blobs.find((b) => b.pathname === INDEX);
const videos = idx ? await (await fetch(`${idx.url}?t=${Date.now()}`, { cache: "no-store" })).json() : [];
if (videos.some((v) => v.id === id)) throw new Error(`Id "${id}" đã tồn tại`);

const blob = await put(`videos/${id}${extname(basename(file))}`, readFileSync(file), {
  access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "video/mp4",
});
const entry = { id, title, category, url: blob.url, size: statSync(file).size, uploadedAt: new Date().toISOString() };
await put(INDEX, JSON.stringify([entry, ...videos]), {
  access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 0,
});
console.log("Đã thêm:", id, blob.url);
