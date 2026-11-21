export type Video = { id: string; title: string; category: string; url: string; size: number; uploadedAt: string };
export type Comment = { id: string; author: string; text: string; time: number; createdAt: string; status?: "open" | "done" };

// Tạo id từ tiêu đề: "Phiếu phân chia" -> "phieu-phan-chia"
export const slugify = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
