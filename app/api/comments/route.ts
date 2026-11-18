import { list, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { videos, type Comment } from "@/lib/videos";

export const dynamic = "force-dynamic";

const path = (id: string) => `comments/${id}.json`;
const valid = (id: unknown): id is string => typeof id === "string" && videos.some((v) => v.id === id);

async function read(id: string): Promise<Comment[]> {
  const { blobs } = await list({ prefix: path(id), limit: 1 });
  if (!blobs[0]) return [];
  const res = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: "no-store" });
  return res.ok ? res.json() : [];
}

const write = (id: string, comments: Comment[]) =>
  put(path(id), JSON.stringify(comments), {
    access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60,
  });

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!valid(id)) return NextResponse.json({ error: "Video không tồn tại" }, { status: 404 });
  return NextResponse.json(await read(id));
}

export async function POST(request: Request) {
  const { id, author, text, time } = await request.json();
  if (!valid(id) || typeof text !== "string" || !text.trim()) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  const c: Comment = {
    id: crypto.randomUUID(),
    author: String(author || "Ẩn danh").slice(0, 50),
    text: text.trim().slice(0, 2000),
    time: Math.max(0, Number(time) || 0),
    createdAt: new Date().toISOString(),
  };
  await write(id, [...(await read(id)), c]);
  return NextResponse.json(c);
}

// Xoá góp ý cần mật khẩu quản trị (biến môi trường ADMIN_PASSWORD)
export async function DELETE(request: Request) {
  const { id, commentId, password } = await request.json();
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
  if (!valid(id)) return NextResponse.json({ error: "Video không tồn tại" }, { status: 404 });
  await write(id, (await read(id)).filter((c) => c.id !== commentId));
  return NextResponse.json({ ok: true });
}
