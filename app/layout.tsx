import type { Metadata } from "next";
import { Cormorant_Garamond, Caveat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-caveat",
});

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
    <html lang="en" className={`${cormorant.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
