import Link from "next/link";
import { videos } from "@/lib/videos";
import { categories, videosOf } from "@/lib/categories";
import Library from "@/components/Library";

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Video hướng dẫn sử dụng</h1>
        <p>{videos.length} video · chọn danh mục hoặc tìm theo tên</p>
      </section>
      <h2>Danh mục</h2>
      <div className="cats">
        {categories.map((c) => (
          <Link key={c.slug} href={`/c/${c.slug}`} className="cat" style={{ ["--c" as string]: c.color }}>
            <span className="ico">{c.icon}</span>
            <b>{c.name}</b>
            <span className="muted">{videosOf(c).length} video</span>
          </Link>
        ))}
      </div>
      <h2>Tất cả video</h2>
      <Library videos={videos} />
    </>
  );
}
