"use client";
import { useState } from "react";
import type { Video } from "@/lib/videos";
import VideoCard from "./VideoCard";

const bo = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export default function Library({ videos }: { videos: Video[] }) {
  const [q, setQ] = useState("");
  const shown = videos.filter((v) => bo(v.title).includes(bo(q)));
  return (
    <section className="home-section video-library" aria-labelledby="videos-title">
      <div className="library-toolbar">
        <h2 id="videos-title">Tất cả video</h2>
        <label className="search-box">
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.2 4.2" />
          </svg>
          <input className="search" placeholder="Tìm video..." value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      <div className="grid">{shown.map((v) => <VideoCard key={v.id} v={v} />)}</div>
      {!shown.length && (
        <div className="empty-search">
          <p>Không tìm thấy video phù hợp</p>
          {q && <button type="button" onClick={() => setQ("")}>Xóa từ khóa</button>}
        </div>
      )}
    </section>
  );
}
