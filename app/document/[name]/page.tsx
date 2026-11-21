import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExcelJS from "exceljs";
import DocxPreview from "../DocxPreview";
import DocPreview from "../DocPreview";
import PptxPreview from "../PptxPreview";

const directory = path.join(process.cwd(), "public", "documents");
const allowedExtensions = new Set([".doc", ".docx", ".xlsx", ".pdf", ".pptx"]);

type CellPreview = { text: string; style: Record<string, string | number> };
type SheetImage = { src: string; cell: string };
type SheetPreview = { name: string; rows: CellPreview[][]; images: SheetImage[] };

export async function generateStaticParams() {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => ({ name: entry.name }));
  } catch {
    return [];
  }
}

function colorToCss(argb?: string) {
  if (!argb) return undefined;
  const hex = argb.length === 8 ? argb.slice(2) : argb;
  return `#${hex}`;
}

function cellStyle(cell: ExcelJS.Cell): Record<string, string | number> {
  const style: Record<string, string | number> = {};
  const font = cell.font ?? {};
  const alignment = cell.alignment ?? {};
  const fill = cell.fill;
  const border = cell.border ?? {};
  const fontColor = colorToCss(font.color?.argb);
  const fillColor = fill?.type === "pattern" ? colorToCss(fill.fgColor?.argb) : undefined;

  if (font.bold) style.fontWeight = "700";
  if (font.italic) style.fontStyle = "italic";
  if (font.underline) style.textDecoration = "underline";
  if (font.size) style.fontSize = `${font.size * 1.15}pt`;
  if (fontColor) style.color = fontColor;
  if (fillColor && fillColor !== "#000000") style.backgroundColor = fillColor;
  if (alignment.horizontal && ["left", "center", "right", "justify"].includes(alignment.horizontal)) {
    style.textAlign = alignment.horizontal;
  }
  if (alignment.vertical) style.verticalAlign = alignment.vertical === "middle" ? "middle" : alignment.vertical;
  if (alignment.wrapText) style.whiteSpace = "pre-wrap";

  for (const side of ["top", "right", "bottom", "left"] as const) {
    const edge = border[side];
    if (edge?.style) {
      const width = edge.style === "thin" || edge.style === "hair" ? "1px" : "2px";
      const color = colorToCss(edge.color?.argb) ?? "#cbd5e1";
      style[`border${side[0].toUpperCase()}${side.slice(1)}`] = `${width} solid ${color}`;
    }
  }

  return style;
}

function excelColumnName(column: number) {
  let name = "";
  for (let current = column; current > 0; current = Math.floor((current - 1) / 26)) {
    name = String.fromCharCode(((current - 1) % 26) + 65) + name;
  }
  return name;
}

async function readWorkbook(buffer: Buffer): Promise<SheetPreview[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  return workbook.worksheets.map((worksheet) => {
      const rows: CellPreview[][] = [];
      worksheet.eachRow({ includeEmpty: true }, (row) => {
        const cells: CellPreview[] = [];
        for (let column = 1; column <= worksheet.columnCount; column += 1) {
          const cell = row.getCell(column);
          cells.push({ text: cell.text, style: cellStyle(cell) });
        }
        rows.push(cells);
      });

      const images = worksheet.getImages().flatMap((image) => {
        const asset = workbook.getImage(Number(image.imageId));
        const bytes = asset.buffer ?? (asset.base64 ? Buffer.from(asset.base64, "base64") : undefined);
        if (!bytes) return [];
        return [{
          src: `data:image/${asset.extension};base64,${bytes.toString("base64")}`,
          cell: `${excelColumnName(Math.floor(image.range.tl.col) + 1)}${Math.floor(image.range.tl.row) + 1}`,
        }];
      });

      return { name: worksheet.name, rows, images };
  });
}

export default async function DocumentViewer({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const extension = path.extname(name).toLowerCase();

  if (path.basename(name) !== name || !allowedExtensions.has(extension)) notFound();

  let sheets: SheetPreview[] = [];
  let previewError = "";

  try {
    if (extension === ".xlsx") {
      const buffer = await readFile(path.join(directory, name));
      sheets = await readWorkbook(buffer);
    }
  } catch {
    previewError = "Không thể đọc nội dung tệp này. Bạn vẫn có thể tải tệp xuống để mở bằng ứng dụng phù hợp.";
  }

  const downloadUrl = `/documents/${encodeURIComponent(name)}`;

  return (
    <>
      <nav className="document-breadcrumbs" aria-label="Điều hướng">
        <Link href="/" className="muted">← Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <Link href="/document" className="muted">Tài liệu</Link>
      </nav>
      <section className="document-viewer-header">
        <div>
          <span className="document-type">{extension.slice(1).toUpperCase()} · XEM TRƯỚC</span>
          <h1>{name}</h1>
          <p className="muted">Nội dung tài liệu hiển thị trên trang web</p>
        </div>
        <a className="document-download-button" href={downloadUrl} download={name}>Tải tài liệu xuống ↓</a>
      </section>

      {previewError ? (
        <section className="document-content document-preview-error">{previewError}</section>
      ) : extension === ".docx" ? (
        <DocxPreview name={name} />
      ) : extension === ".doc" ? (
        <DocPreview name={name} />
      ) : extension === ".xlsx" ? (
        <div className="document-content document-sheets">
          {sheets.map((sheet) => (
            <section className="document-sheet" key={sheet.name}>
              <h2>{sheet.name}</h2>
              <div className="document-table-scroll">
                <table>
                  <tbody>
                    {sheet.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => <td key={cellIndex} style={cell.style}>{cell.text}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sheet.images.length > 0 && (
                <div className="spreadsheet-images">
                  {sheet.images.map((image, index) => (
                      <figure key={`${image.cell}-${index}`}>
                      <img src={image.src} alt={`Hình ảnh trong sheet ${sheet.name}`} />
                      <figcaption className="muted">Vị trí gần ô {image.cell}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      ) : extension === ".pdf" ? (
        <section className="document-content document-pdf-shell">
          <iframe
            className="document-pdf-preview"
            src={`${downloadUrl}#toolbar=1&navpanes=0`}
            title={`Xem trước PDF: ${name}`}
          />
        </section>
      ) : extension === ".pptx" ? (
        <PptxPreview name={name} />
      ) : null}
    </>
  );
}
