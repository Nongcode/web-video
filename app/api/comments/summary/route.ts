import { list } from "@vercel/blob";
import { NextResponse } from "next/server";
import type { Comment } from "@/lib/videos";

export const dynamic = "force-dynamic";

// Trả về { [videoId]: { open, done } } để hiện nhãn trên thẻ video
export async function GET() {
  try {
    const { blobs } = await list({ prefix: "comments/", limit: 1000 });
    const out: Record<string, { open: number; done: number }> = {};
    await Promise.all(
      blobs.map(async (b) => {
        const res = await fetch(`${b.url}?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const list: Comment[] = await res.json();
        const id = b.pathname.slice("comments/".length).replace(/\.json$/, "");
        const done = list.filter((c) => c.status === "done").length;
        if (list.length) out[id] = { open: list.length - done, done };
      }),
    );
    return NextResponse.json(out);
  } catch {
    return NextResponse.json({});
  }
}
