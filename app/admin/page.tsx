"use client";
import { upload } from "@vercel/blob/client";
import { useEffect, useState } from "react";
import { categories } from "@/lib/categories";
import { slugify, type Video } from "@/lib/videos";

const api = (path: string, method: string, body: object) =>
  fetch(path, { method, body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });

export default function Admin() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0].slug);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => fetch("/api/videos", { cache: "no-store" }).then((r) => r.json()).then(setVideos);

  async function login(p: string) {
    const res = await api("/api/auth", "POST", { password: p });
    if (res.ok) {
      sessionStorage.setItem("pw", p);
      setPw(p);
      setAuthed(true);
      load();
    } else {
      sessionStorage.removeItem("pw");
      setErr("Sai mật khẩu.");
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("pw");
    if (saved) login(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function add() {
    if (!file || !title.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const id = `${slugify(title)}-${Date.now().toString(36)}`;
      const ext = file.name.split(".").pop() ?? "mp4";
      setMsg("Đang tải lên…");
      const blob = await upload(`videos/${id}.${ext}`, file, {
        access: "public", handleUploadUrl: "/api/upload", clientPayload: pw, multipart: true,
        onUploadProgress: (p) => setMsg(`Đang tải lên: ${p.percentage.toFixed(0)}%`),
      });
      setMsg("Đang lưu thông tin…");
      const res = await api("/api/videos", "POST", { password: pw, id, title, category, url: blob.url, size: file.size });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg("Đã thêm video.");
      setFile(null);
      setTitle("");
      load();
    } catch (e) {
      setMsg("");
      setErr((e as Error).message);
    }
    setBusy(false);
  }

  async function remove(v: Video) {
    if (!confirm(`Xoá "${v.title}" cùng toàn bộ góp ý?`)) return;
    const res = await api("/api/videos", "DELETE", { password: pw, id: v.id });
    if (res.ok) load(); else setErr((await res.json()).error);
  }

  if (!authed) {
    return (
      <div className="panel" style={{ maxWidth: 420 }}>
        <h2>Quản trị</h2>
        <div className="row">
          <input type="password" placeholder="Mật khẩu quản trị" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login(pw)} style={{ flex: 1 }} />
          <button onClick={() => login(pw)}>Vào</button>
        </div>
        {err && <p className="err">{err}</p>}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Thêm video</h2>
        <div className="row"><input placeholder="Tiêu đề video" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 1 }} /></div>
        <div className="row">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <input key={file ? file.name : "none"} type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="row">
          <button onClick={add} disabled={busy || !file || !title.trim()}>Tải lên</button>
          {msg && <span>{msg}</span>}
        </div>
        {err && <p className="err">{err}</p>}
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Video hiện có ({videos.length})</h2>
        {videos.map((v) => (
          <VideoRow key={v.id} v={v} onSave={async (title, category) => {
            const res = await api("/api/videos", "PATCH", { password: pw, id: v.id, title, category });
            if (res.ok) load(); else setErr((await res.json()).error);
          }} onDelete={() => remove(v)} />
        ))}
      </div>
    </div>
  );
}

function VideoRow({ v, onSave, onDelete }: { v: Video; onSave: (t: string, c: string) => void; onDelete: () => void }) {
  const [t, setT] = useState(v.title);
  const [c, setC] = useState(v.category);
  const dirty = t !== v.title || c !== v.category;
  return (
    <div className="row" style={{ borderTop: "1px solid #eee", paddingTop: 8 }}>
      <input value={t} onChange={(e) => setT(e.target.value)} style={{ flex: 2 }} />
      <select value={c} onChange={(e) => setC(e.target.value)}>
        {categories.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
      </select>
      <button disabled={!dirty || !t.trim()} onClick={() => onSave(t, c)}>Lưu</button>
      <button className="ghost" onClick={onDelete}>Xoá</button>
    </div>
  );
}
