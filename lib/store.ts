import { list, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import type { Video } from "./videos";

// Chỉ mục video nằm trong Blob (index/videos.json). Video thật nằm ở videos/<id>.<ext>.
const INDEX = "index/videos.json";

export async function readVideos(): Promise<Video[]> {
  const { blobs } = await list({ prefix: INDEX, limit: 1 });
  const b = blobs.find((x) => x.pathname === INDEX);
  if (!b) return [];
  const res = await fetch(`${b.url}?t=${Date.now()}`, { cache: "no-store" });
  return res.ok ? res.json() : [];
}

export const writeVideos = (videos: Video[]) =>
  put(INDEX, JSON.stringify(videos), {
    access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 0,
  });

export const checkPassword = (pw: unknown) => !!process.env.ADMIN_PASSWORD && pw === process.env.ADMIN_PASSWORD;

export const denied = () => NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
