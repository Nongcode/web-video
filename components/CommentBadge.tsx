"use client";
import { useEffect, useState } from "react";

type Summary = Record<string, { open: number; done: number }>;

// Mỗi lần tải trang chỉ gọi API một lần cho tất cả thẻ video
let pending: Promise<Summary> | null = null;
let at = 0;
const getSummary = () => {
  if (!pending || Date.now() - at > 5000) {
    at = Date.now();
    pending = fetch("/api/comments/summary", { cache: "no-store" }).then((r) => r.json()).catch(() => ({}));
  }
  return pending;
};

export default function CommentBadge({ id }: { id: string }) {
  const [s, setS] = useState<{ open: number; done: number } | undefined>();
  useEffect(() => {
    getSummary().then((all) => setS(all[id]));
  }, [id]);
  if (!s) return null;
  return s.open > 0
    ? <span className="badge open">💬 {s.open} góp ý chưa xử lý</span>
    : <span className="badge done">✓ Đã xử lý {s.done} góp ý</span>;
}
