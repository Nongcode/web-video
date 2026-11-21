import Link from "next/link";
import type { Video } from "@/lib/videos";
import { categoryBySlug } from "@/lib/categories";
import CommentBadge from "./CommentBadge";

export default function VideoCard({ v }: { v: Video }) {
  const cat = categoryBySlug(v.category);
  return (
    <Link href={`/v/${v.id}`} className="card">
      <div className="thumb">
        <video src={`${v.url}#t=0.5`} preload="metadata" muted />
        <span className="play">▶</span>
        <CommentBadge id={v.id} />
        {v.approved && <span className="approved-tag card-approved">✓ Đã duyệt</span>}
      </div>
      <div className="info">
        {cat && <span className="tag" style={{ background: cat.color }}>{cat.name}</span>}
        <b>{v.title}</b>
        <div className="muted">{(v.size / 1048576).toFixed(1)} MB</div>
      </div>
    </Link>
  );
}
