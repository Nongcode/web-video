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

  const sorted = [...comments].sort((a, b) => a.time - b.time);
  return (
    <div className="watch">
      <div>
        <video ref={ref} src={videoUrl(video.id)} controls preload="metadata" />
        <h2>{video.title}</h2>
      </div>
      <div className="panel">
        <b>Góp ý ({comments.length})</b>
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
          <div className="cm" key={c.id}>
            <button className="ts" onClick={() => { if (ref.current) { ref.current.currentTime = c.time; ref.current.play(); } }}>{fmt(c.time)}</button>{" "}
            <b>{c.author}</b>
            <button className="ghost" style={{ float: "right", padding: "0 6px" }} onClick={() => remove(c.id)}>×</button>
            <div style={{ whiteSpace: "pre-wrap" }}>{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
