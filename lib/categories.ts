export type Category = { slug: string; name: string; icon: string; color: string };

// Danh mục cố định trong code. Thêm danh mục mới: thêm một dòng ở đây rồi deploy lại.
export const categories: Category[] = [
  { slug: "xe", name: "Danh mục xe", icon: "🚚", color: "#2563eb" },
  { slug: "chung", name: "Danh mục chung", icon: "📚", color: "#d97706" },
  { slug: "app-dien-thoai", name: "App điện thoại", icon: "📱", color: "#0891b2" },
  { slug: "phan-chia-thi-truong", name: "Phiếu phân chia thị trường", icon: "🧭", color: "#9333ea" },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
