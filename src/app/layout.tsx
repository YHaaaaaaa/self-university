import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Self University",
  description: "意志力に依存せず、大学制度のように毎日学習を継続する",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
