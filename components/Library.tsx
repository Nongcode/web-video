"use client";
import { useState } from "react";
import type { Video } from "@/lib/videos";
import VideoCard from "./VideoCard";

const bo = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export default function Library({ videos }: { videos: Video[] }) {
  const [q, setQ] = useState("");
  const shown = videos.filter((v) => bo(v.title).includes(bo(q)));
  return (
    <>
      <input className="search" placeholder="🔍 Tìm video…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid">{shown.map((v) => <VideoCard key={v.id} v={v} />)}</div>
      {!shown.length && <p className="muted">Không có video phù hợp.</p>}
    </>
  );
}
