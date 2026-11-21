"use client";

import { useEffect, useRef, useState } from "react";

export default function DocPreview({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderDocument() {
      try {
        const response = await fetch(`/documents/${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error();
        const data = await response.arrayBuffer();
        const container = root.current;
        if (cancelled || !container) return;

        const { parseMsDocToHtml, mountMsDoc } = await import("@file-viewer/doc");
        if (cancelled || !root.current) return;
        container.replaceChildren();
        mountMsDoc(container, await parseMsDocToHtml(data));
        if (!cancelled) setLoaded(true);
      } catch {
        if (!cancelled) setError("Không thể hiển thị tệp DOC này. Bạn vẫn có thể tải tệp xuống để mở bằng Word.");
      }
    }

    void renderDocument();
    return () => { cancelled = true; };
  }, [name]);

  return (
    <section className="document-content office-preview-shell">
      {error ? <p className="document-preview-error">{error}</p> : !loaded ? <p className="muted">Đang tải bản xem trước…</p> : null}
      <div ref={root} className="legacy-doc-preview" />
    </section>
  );
}
