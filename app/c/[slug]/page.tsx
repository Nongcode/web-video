import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, videosOf } from "@/lib/categories";
import VideoCard from "@/components/VideoCard";

export const generateStaticParams = () => categories.map((c) => ({ slug: c.slug }));

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();
  return (
    <>
      <p><Link href="/" className="muted">← Trang chủ</Link></p>
      <section className="hero" style={{ ["--c" as string]: cat.color }}>
        <h1>{cat.icon} {cat.name}</h1>
        <p>{videosOf(cat).length} video</p>
      </section>
      <div className="grid">{videosOf(cat).map((v) => <VideoCard key={v.id} v={v} />)}</div>
    </>
  );
}
