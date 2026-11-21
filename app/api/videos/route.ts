import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { categories } from "@/lib/categories";
import { readVideos, readComments, writeVideos, checkPassword, denied } from "@/lib/store";
import type { Video } from "@/lib/videos";

export const dynamic = "force-dynamic";

const okCategory = (c: unknown): c is string => typeof c === "string" && categories.some((x) => x.slug === c);
const okTitle = (t: unknown): t is string => typeof t === "string" && t.trim().length > 0 && t.trim().length <= 200;

export async function GET() {
  return NextResponse.json(await readVideos(), { headers: { "Cache-Control": "no-store" } });
}

// Thêm video sau khi đã tải file lên Blob
export async function POST(request: Request) {
  const { password, id, title, category, url, size } = await request.json();
  if (!checkPassword(password)) return denied();
  if (typeof id !== "string" || !/^[a-z0-9-]+$/.test(id)) return NextResponse.json({ error: "Id không hợp lệ" }, { status: 400 });
  if (!okTitle(title) || !okCategory(category) || typeof url !== "string") return NextResponse.json({ error: "Thiếu tiêu đề, danh mục hoặc file" }, { status: 400 });
  const videos = await readVideos();
  if (videos.some((v) => v.id === id)) return NextResponse.json({ error: "Id đã tồn tại" }, { status: 409 });
  const v: Video = { id, title: title.trim(), category, url, size: Number(size) || 0, uploadedAt: new Date().toISOString() };
  await writeVideos([v, ...videos]);
  return NextResponse.json(v);
}

// Sửa tiêu đề, danh mục hoặc trạng thái duyệt
export async function PATCH(request: Request) {
  const { password, id, title, category, approved, url, size } = await request.json();
  // Duyệt / bỏ duyệt không cần mật khẩu; sửa tiêu đề hoặc danh mục thì cần
  const editing = title !== undefined || category !== undefined || url !== undefined;
  if (editing && !checkPassword(password)) return denied();
  if ((title !== undefined && !okTitle(title)) || (category !== undefined && !okCategory(category)) || (approved !== undefined && typeof approved !== "boolean"))
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  if (url !== undefined && typeof url !== "string") return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  const videos = await readVideos();
  if (!videos.some((v) => v.id === id)) return NextResponse.json({ error: "Không tìm thấy video" }, { status: 404 });
  // Chỉ duyệt khi không còn góp ý nào chưa thực hiện
  if (approved === true && (await readComments(id)).some((c) => (c.status ?? "open") === "open"))
    return NextResponse.json({ error: "Còn góp ý chưa thực hiện" }, { status: 409 });
  const old = videos.find((v) => v.id === id)!;
  // Thay file video: đổi url, đặt lại trạng thái duyệt, xoá file cũ
  const replacing = url !== undefined && url !== old.url;
  await writeVideos(videos.map((v) => (v.id === id ? {
    ...v,
    ...(title !== undefined && { title: title.trim() }),
    ...(category !== undefined && { category }),
    ...(replacing && { url, size: Number(size) || 0, approved: false }),
    ...(approved !== undefined && !replacing && { approved }),
  } : v)));
  if (replacing) await del(old.url);
  return NextResponse.json({ ok: true });
}

// Xoá video, file và góp ý của video
export async function DELETE(request: Request) {
  const { password, id } = await request.json();
  if (!checkPassword(password)) return denied();
  const videos = await readVideos();
  const v = videos.find((x) => x.id === id);
  if (!v) return NextResponse.json({ error: "Không tìm thấy video" }, { status: 404 });
  await writeVideos(videos.filter((x) => x.id !== id));
  const { blobs } = await list({ prefix: `comments/${id}.json`, limit: 1 });
  await del([v.url, ...blobs.map((b) => b.url)]);
  return NextResponse.json({ ok: true });
}
