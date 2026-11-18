import Link from "next/link";
import { videoUrl, type Video } from "@/lib/videos";
import { categoryOf } from "@/lib/categories";

export default function VideoCard({ v }: { v: Video }) {
  const cat = categoryOf(v.id);
  return (
    <Link href={`/v/${v.id}`} className="card">
      <div className="thumb">
        <video src={`${videoUrl(v.id)}#t=0.5`} preload="metadata" muted />
        <span className="play">▶</span>
      </div>
      <div className="info">
        {cat && <span className="tag" style={{ background: cat.color }}>{cat.name}</span>}
        <b>{v.title}</b>
        <div className="muted">{(v.size / 1048576).toFixed(1)} MB</div>
      </div>
    </Link>
  );
}
