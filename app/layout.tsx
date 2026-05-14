import type { Metadata } from "next";
import "./globals.css";
import { googleFontClassName } from "./fonts";

export const metadata: Metadata = {
  title: "Aria Space — A Personal Archive",
  description:
    "A personal archive of memories, projects, and spaces. A quiet digital exhibition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={googleFontClassName}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
