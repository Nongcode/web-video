"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { videoUrl, type Comment, type Video } from "@/lib/videos";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Góp ý lưu chung trên server (Vercel Blob qua /api/comments), mọi người cùng thấy.
export default function Player({ video }: { video: Video }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?id=${video.id}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setComments(await res.json());
    } catch {
      setErr("Không tải được góp ý.");
    }
  }, [video.id]);

  useEffect(() => {
    setAuthor(localStorage.getItem("author") ?? "");
    load();
  }, [load]);

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    setErr("");
    localStorage.setItem("author", author);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        body: JSON.stringify({ id: video.id, author, text, time: ref.current?.currentTime ?? 0 }),
      });
      if (!res.ok) throw new Error();
      setText("");
      await load();
    } catch {
      setErr("Gửi góp ý thất bại, thử lại nhé.");
    }
    setBusy(false);
  }

  async function remove(commentId: string) {
    const password = prompt("Mật khẩu quản trị để xoá góp ý:");
    if (!password) return;
    const res = await fetch("/api/comments", { method: "DELETE", body: JSON.stringify({ id: video.id, commentId, password }) });
    if (res.ok) setComments((p) => p.filter((c) => c.id !== commentId));
    else setErr("Sai mật khẩu.");
  }

  async function toggle(c: Comment) {
    const password = sessionStorage.getItem("pw") ?? prompt("Mật khẩu quản trị để đổi trạng thái:");
    if (!password) return;
    const status = c.status === "done" ? "open" : "done";
    const res = await fetch("/api/comments", { method: "PATCH", body: JSON.stringify({ id: video.id, commentId: c.id, status, password }) });
    if (res.ok) {
      sessionStorage.setItem("pw", password);
      setComments((p) => p.map((x) => (x.id === c.id ? { ...x, status } : x)));
    } else {
      sessionStorage.removeItem("pw");
      setErr("Sai mật khẩu.");
    }
  }

  const sorted = [...comments].filter((c) => filter === "all" || (c.status ?? "open") === filter).sort((a, b) => a.time - b.time);
  const nOpen = comments.filter((c) => (c.status ?? "open") === "open").length;
  return (
    <div className="watch">
      <div>
        <video ref={ref} src={videoUrl(video.id)} controls preload="metadata" />
        <h2>{video.title}</h2>
      </div>
      <div className="panel">
        <b>Góp ý ({comments.length})</b>
        <div className="tabs">
          <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Tất cả</button>
          <button className={filter === "open" ? "on" : ""} onClick={() => setFilter("open")}>Chưa thực hiện ({nOpen})</button>
          <button className={filter === "done" ? "on" : ""} onClick={() => setFilter("done")}>Hoàn thành ({comments.length - nOpen})</button>
        </div>
        <div className="row">
          <input placeholder="Tên của bạn" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ flex: 1 }} />
        </div>
        <textarea rows={3} placeholder="Góp ý tại thời điểm đang xem…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="row">
          <button onClick={send} disabled={busy || !text.trim()}>{busy ? "Đang gửi…" : "Gửi góp ý tại thời điểm hiện tại"}</button>
          <button className="ghost" onClick={load}>Làm mới</button>
        </div>
        {err && <p style={{ color: "#d1242f" }}>{err}</p>}
        {sorted.map((c) => (
          <div className={`cm ${c.status === "done" ? "is-done" : ""}`} key={c.id}>
            <button className="ts" onClick={() => { if (ref.current) { ref.current.currentTime = c.time; ref.current.play(); } }}>{fmt(c.time)}</button>{" "}
            <b>{c.author}</b>{" "}
            <span className={`st ${c.status === "done" ? "done" : "open"}`}>{c.status === "done" ? "Hoàn thành" : "Chưa thực hiện"}</span>
            <button className="ghost" style={{ float: "right", padding: "0 6px" }} onClick={() => remove(c.id)}>×</button>
            <div style={{ whiteSpace: "pre-wrap" }}>{c.text}</div>
            <button className="ghost" style={{ padding: "1px 8px", fontSize: 12 }} onClick={() => toggle(c)}>
              {c.status === "done" ? "Mở lại" : "Đánh dấu hoàn thành"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
