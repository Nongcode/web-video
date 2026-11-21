import "./globals.css";
import Link from "next/link";

export const metadata = { title: "Video hướng dẫn sử dụng" };

// suppressHydrationWarning: tiện ích trình duyệt (vd. Bitdefender) chèn thuộc tính bis_skin_checked vào DOM trước khi React hydrate.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <header>
          <Link href="/">▶ Video hướng dẫn sử dụng</Link>
          <Link href="/admin" style={{ opacity: 0.85 }}>⚙ Quản trị</Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
