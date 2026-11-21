import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

const allowedExtensions = new Set([".doc", ".docx", ".xlsx", ".pdf", ".pptx"]);

type DocumentFile = { name: string; extension: string; size: number };

async function getDocuments(): Promise<DocumentFile[]> {
  const directory = path.join(process.cwd(), "public", "documents");
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()))
        .map(async (entry) => ({
          name: entry.name,
          extension: path.extname(entry.name).slice(1).toUpperCase(),
          size: (await stat(path.join(directory, entry.name))).size,
        })),
    );

    return files.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  } catch {
    return [];
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <>
      <p><Link href="/" className="muted">← Trang chủ</Link></p>
      <section className="hero document-hero" style={{ ["--c" as string]: "#7c3aed" }}>
        <h1>📄 Tài liệu</h1>
        <p>{documents.length} tài liệu hướng dẫn · chọn tệp để tải xuống</p>
      </section>

      {documents.length ? (
        <div className="document-grid">
          {documents.map((document) => (
            <a className="document-card" href={`/document/${encodeURIComponent(document.name)}`} key={document.name}>
              <span className="document-icon" aria-hidden="true">📄</span>
              <span className="document-info">
                <strong>{document.name}</strong>
                <span className="muted">{document.extension} · {formatSize(document.size)}</span>
              </span>
              <span className="document-download" aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      ) : (
        <section className="panel document-empty">
          <h2>Chưa có tài liệu nào</h2>
        </section>
      )}
    </>
  );
}
