import Link from "next/link";
import { readVideos } from "@/lib/store";
import { categories } from "@/lib/categories";
import Library from "@/components/Library";
import VideoCard from "@/components/VideoCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const videos = await readVideos();
  const approvedVideos = videos.filter((v) => v.approved);
  return (
    <div className="home-page">
      <section className="hero home-hero">
        <h1>Video hướng dẫn sử dụng</h1>
        <p>{videos.length} video · chọn danh mục hoặc tìm kiếm nhanh trên thanh tìm kiếm</p>
      </section>
      <section className="home-section" aria-labelledby="categories-title">
        <h2 id="categories-title">Danh mục</h2>
        <div className="cats">
          {categories.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="cat" style={{ ["--c" as string]: c.color }}>
              <span className="ico" aria-hidden="true">{c.icon}</span>
              <span className="cat-copy">
                <b>{c.name}</b>
                <span className="muted">{videos.filter((v) => v.category === c.slug).length} video</span>
              </span>
            </Link>
          ))}
          <Link href="/document" className="cat document-category" style={{ ["--c" as string]: "#7c3aed" }}>
            <span className="ico" aria-hidden="true">📄</span>
            <span className="cat-copy">
              <b>Tài liệu</b>
              <span className="muted">Tài liệu hướng dẫn</span>
            </span>
          </Link>
        </div>
      </section>
      <section className="home-section" aria-labelledby="approved-title">
        <h2 id="approved-title">Video đã duyệt ({approvedVideos.length})</h2>
        {approvedVideos.length ? (
          <div className="grid">{approvedVideos.map((v) => <VideoCard key={v.id} v={v} />)}</div>
        ) : (
          <p className="muted">Chưa có video nào được duyệt.</p>
        )}
      </section>
      <Library videos={videos} />
    </div>
  );
}
