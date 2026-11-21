"use client";

import { useEffect, useRef, useState } from "react";

export default function PptxPreview({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let destroy: (() => void) | undefined;
    let resizeObserver: ResizeObserver | undefined;

    async function renderPresentation() {
      try {
        const response = await fetch(`/documents/${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error("Could not load presentation.");

        const file = await response.blob();
        const container = root.current;
        if (cancelled || !container) return;

        const { renderPptx } = await import("ooxml-pages/pptx");
        if (cancelled || !root.current) return;

        const view = await renderPptx(file, container, {
          frame: (slide, { index, hidden }) => {
            const figure = document.createElement("figure");
            figure.className = "pptx-slide-frame";
            figure.append(slide);

            const caption = document.createElement("figcaption");
            caption.textContent = `Trang chiếu ${index + 1}${hidden ? " (ẩn)" : ""}`;
            figure.append(caption);
            return figure;
          },
        });

        const fitSlides = () => {
          const availableWidth = Math.max(0, container.clientWidth - 32);
          for (const slide of view.slides) {
            if (slide.offsetWidth > 0) {
              slide.style.zoom = String(Math.min(1, availableWidth / slide.offsetWidth));
            }
          }
        };
        fitSlides();
        resizeObserver = new ResizeObserver(fitSlides);
        resizeObserver.observe(container);
        destroy = () => view.destroy();
        if (cancelled) {
          view.destroy();
          return;
        }
        setLoaded(true);
      } catch {
        if (!cancelled) {
          setError("Không thể hiển thị tệp PowerPoint này. Bạn vẫn có thể tải tệp xuống để mở bằng PowerPoint hoặc ứng dụng tương thích.");
        }
      }
    }

    void renderPresentation();
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      destroy?.();
    };
  }, [name]);

  return (
    <section className="document-content pptx-preview-shell">
      {error ? <p className="document-preview-error">{error}</p> : !loaded ? <p className="muted">Đang tải bản xem trước…</p> : null}
      <div ref={root} className="pptx-preview-root pptx-deck" />
    </section>
  );
}
