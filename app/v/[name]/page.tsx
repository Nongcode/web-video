import Link from "next/link";
import { notFound } from "next/navigation";
import { videos } from "@/lib/videos";
import { categoryOf, videosOf } from "@/lib/categories";
import VideoCard from "@/components/VideoCard";
import Player from "./Player";

export const generateStaticParams = () => videos.map((v) => ({ name: v.id }));

export default async function Watch({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const video = videos.find((v) => v.id === name);
  if (!video) notFound();
  const cat = categoryOf(video.id);
  const related = cat ? videosOf(cat).filter((v) => v.id !== video.id) : [];
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
