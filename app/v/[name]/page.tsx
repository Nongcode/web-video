import Link from "next/link";
import { notFound } from "next/navigation";
import { readVideos } from "@/lib/store";
import { categoryBySlug } from "@/lib/categories";
import VideoCard from "@/components/VideoCard";
import Player from "./Player";

export const dynamic = "force-dynamic";

export default async function Watch({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const videos = await readVideos();
  const video = videos.find((v) => v.id === name);
  if (!video) notFound();
  const cat = categoryBySlug(video.category);
  const related = videos.filter((v) => v.category === video.category && v.id !== video.id);
  return (
    <>
      <p>
        <Link href="/" className="muted">← Trang chủ</Link>
        {cat && <> / <Link href={`/c/${cat.slug}`} className="muted">{cat.name}</Link></>}
      </p>
      <Player video={video} />
      {related.length > 0 && (
        <>
          <h2>Video liên quan</h2>
          <div className="grid">{related.map((v) => <VideoCard key={v.id} v={v} />)}</div>
        </>
      )}
    </>
  );
}
