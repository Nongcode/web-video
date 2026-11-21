import Link from "next/link";
import { videos } from "@/lib/videos";
import { categories, videosOf } from "@/lib/categories";
import Library from "@/components/Library";

export default function Home() {
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
                <span className="muted">{videosOf(c).length} video</span>
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
      <Library videos={videos} />
    </div>
  );
}
