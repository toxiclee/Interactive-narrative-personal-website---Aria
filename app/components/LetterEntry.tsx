"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LetterEntry() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    function handleScroll() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const enter = 1 - rect.top / window.innerHeight;
      setVisible(Math.max(0, Math.min(1, enter)));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeIn = Math.min(1, visible / 0.5);
  const rise = (1 - fadeIn) * 40;
  const imgScale = 0.95 + fadeIn * 0.05;

  return (
    <section
      ref={ref}
      style={{
        background: "#fff",
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: fadeIn,
          transform: `translateY(${rise}px) scale(${imgScale})`,
          transition: "transform 0.15s linear, opacity 0.15s linear",
        }}
      >
        {/* Oil painting frame */}
        <Link
          href="/letter"
          style={{
            display: "block",
            width: "260px",
            height: "260px",
            position: "relative",
            borderRadius: "2px",
            padding: "12px",
            background: "linear-gradient(145deg, #c4a86a, #a8924e, #d4b878, #b89c58, #c4a86a)",
            boxShadow: `
              0 4px 12px rgba(0,0,0,0.15),
              0 12px 40px rgba(0,0,0,0.1),
              inset 0 1px 0 rgba(255,220,160,0.4),
              inset 0 -1px 0 rgba(80,60,20,0.3)
            `,
            transition: "transform 0.5s ease, box-shadow 0.5s ease",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = `
              0 12px 30px rgba(0,0,0,0.18),
              0 24px 60px rgba(0,0,0,0.1),
              inset 0 1px 0 rgba(255,220,160,0.4),
              inset 0 -1px 0 rgba(80,60,20,0.3)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = `
              0 4px 12px rgba(0,0,0,0.15),
              0 12px 40px rgba(0,0,0,0.1),
              inset 0 1px 0 rgba(255,220,160,0.4),
              inset 0 -1px 0 rgba(80,60,20,0.3)
            `;
          }}
        >
          {/* Inner frame bevel */}
          <div
            style={{
              position: "absolute",
              inset: "10px",
              border: "2px solid rgba(160,130,60,0.35)",
              borderRadius: "1px",
              pointerEvents: "none",
              boxShadow: "inset 0 0 8px rgba(0,0,0,0.08)",
            }}
          />

          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <Image
              src="/letter.jpg"
              alt="A letter from the archive"
              fill
              className="object-cover"
              style={{ objectPosition: "center top" }}
            />
          </div>
        </Link>

        <p
          style={{
            fontFamily: "var(--body-font-family)",
            fontSize: "var(--step--1)",
            color: "var(--color-soft-soil)",
            marginTop: "var(--space-m)",
            letterSpacing: "0.05em",
            textAlign: "center",
          }}
        >
          2025 — A Letter from New Haven
        </p>

        <p
          style={{
            fontFamily: "var(--body-font-family)",
            fontSize: "clamp(0.65rem, 0.75vw, 0.8rem)",
            color: "var(--color-soft-soil)",
            marginTop: "var(--space-xs)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.35,
          }}
        >
          Click to read
        </p>
      </div>
    </section>
  );
}
