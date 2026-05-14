"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const EmbodiedLetter = dynamic(
  () => import("../components/EmbodiedLetter"),
  { ssr: false }
);

export default function LetterPage() {
  return (
    <main
      style={{
        background: "#fff",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          padding: "var(--space-m) var(--container-padding)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            color: "var(--color-soft-soil)",
            textDecoration: "none",
            transition: "color 0.3s ease, transform 0.3s ease",
            display: "inline-flex",
            alignItems: "center",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = "var(--color-text-main)";
            e.currentTarget.style.transform = "translateX(-3px)";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = "var(--color-soft-soil)";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="15" y1="10" x2="5" y2="10" />
            <polyline points="10,5 5,10 10,15" />
          </svg>
        </Link>

        <span
          style={{
            fontFamily: "var(--body-font-family)",
            fontSize: "var(--step--1)",
            color: "var(--color-soft-soil)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          Aria Space
        </span>

        <div style={{ width: "20px" }} />
      </nav>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <EmbodiedLetter />
      </div>
    </main>
  );
}
