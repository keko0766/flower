import type { Metadata } from "next";
import { cormorant, montserrat } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Админка — Ақ Гүл", template: "%s — Админка Ақ Гүл" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="ru" className={`${montserrat.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
