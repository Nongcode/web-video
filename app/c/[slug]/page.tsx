import Link from "next/link";
import { notFound } from "next/navigation";
import { readVideos } from "@/lib/store";
import { categories, categoryBySlug } from "@/lib/categories";
import VideoCard from "@/components/VideoCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();
  const videos = (await readVideos()).filter((v) => v.category === cat.slug);
  return (
    <>
      <p><Link href="/" className="muted">← Trang chủ</Link></p>
      <section className="hero" style={{ ["--c" as string]: cat.color }}>
        <h1>{cat.icon} {cat.name}</h1>
        <p>{videos.length} video</p>
      </section>
      <div className="grid">{videos.map((v) => <VideoCard key={v.id} v={v} />)}</div>
    </>
  );
}
