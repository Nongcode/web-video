import { videos, type Video } from "./videos";

export type Category = { slug: string; name: string; icon: string; color: string; ids: string[] };

const dm = (list: string[]) => list.map((s) => `huong-dan-danh-muc-${s}`);

// Gán video vào danh mục theo id (tên thư mục). Video chưa gán sẽ vào "Khác".
const raw: Category[] = [
  { slug: "xe", name: "Danh mục xe", icon: "🚚", color: "#2563eb", ids: dm(["xe", "doi-xe", "dong-xe", "hang-xe", "loai-xe", "model-xe", "tai-trong-xe", "bien-so-xe", "nhien-lieu", "lai-xe-ngoai"]) },
  { slug: "chung", name: "Danh mục chung", icon: "📚", color: "#d97706", ids: dm(["chuong", "muc", "tieu-muc", "ngan-hang", "linh-vuc-cong-ty-kinh-doanh"]) },
  { slug: "app-dien-thoai", name: "App điện thoại", icon: "📱", color: "#0891b2", ids: ["cai-dat-ung-dung"] },
];

const assigned = new Set(raw.flatMap((c) => c.ids));
const other = videos.filter((v) => !assigned.has(v.id)).map((v) => v.id);
export const categories: Category[] = other.length
  ? [...raw, { slug: "khac", name: "Khác", icon: "📁", color: "#64748b", ids: other }]
  : raw;

export const videosOf = (c: Category): Video[] => videos.filter((v) => c.ids.includes(v.id));
export const categoryOf = (id: string) => categories.find((c) => c.ids.includes(id));
