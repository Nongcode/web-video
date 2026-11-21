import Link from "next/link";
import { readVideos } from "@/lib/store";
import { categories } from "@/lib/categories";
import Library from "@/components/Library";

export const dynamic = "force-dynamic";

export default async function Home() {
  const videos = await readVideos();
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
            <span className="muted">{videos.filter((v) => v.category === c.slug).length} video</span>
          </Link>
        ))}
      </div>
      <h2>Tất cả video</h2>
      {videos.length ? <Library videos={videos} /> : <p className="muted">Chưa có video nào. Quản trị viên tải lên ở mục Quản trị.</p>}
    </>
  );
}
