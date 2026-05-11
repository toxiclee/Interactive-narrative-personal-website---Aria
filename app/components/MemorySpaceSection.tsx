"use client";

import { useEffect, useRef, useState } from "react";

export default function MemorySpaceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(0);

  useEffect(() => {
    function handleScroll() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setVis(Math.max(0, Math.min(1, 1 - rect.top / (window.innerHeight * 0.75))));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={ref}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "var(--space-xl) var(--container-padding)",
      }}
    >
      <div style={{
        opacity: vis,
        transform: `translateY(${(1 - vis) * 25}px) scale(${0.96 + vis * 0.04})`,
        maxWidth: 520,
      }}>
        <div style={{
          fontSize: "var(--step-1)", color: "var(--color-accent)",
          marginBottom: "var(--space-m)", letterSpacing: "0.5em", opacity: 0.35,
        }}>✦ ✦ ✦</div>

        <p style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
          color: "var(--color-soft-soil)", letterSpacing: "0.15em",
          textTransform: "uppercase", marginBottom: "var(--space-s)",
        }}>Coming soon</p>

        <h2 style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step-2)",
          fontWeight: 300, color: "var(--color-text-main)", lineHeight: 1.2,
          marginBottom: "var(--space-m)",
        }}>Enter My 3D Memory Space</h2>

        <p style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step-0)",
          fontWeight: 300, fontStyle: "italic", color: "var(--color-text-soft)",
          lineHeight: 1.7, marginBottom: "var(--space-l)",
        }}>
          A room you can walk through. Memories on the walls.
          Sounds in the air. An immersive archive, built in three dimensions.
        </p>

        <button className="group" style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
          letterSpacing: "0.15em", textTransform: "uppercase",
          color: "var(--color-text-main)", background: "transparent",
          border: "1px solid var(--color-accent)",
          borderRadius: "var(--radius-card)",
          padding: "var(--space-s) var(--space-l)",
          cursor: "pointer", transition: "var(--transition-slow)",
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-text-main)";
            e.currentTarget.style.color = "var(--color-warm-cream)";
            e.currentTarget.style.borderColor = "var(--color-text-main)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--color-text-main)";
            e.currentTarget.style.borderColor = "var(--color-accent)";
          }}
        >Explore the Space</button>
      </div>

      <p style={{
        marginTop: "var(--space-xl)",
        fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
        color: "var(--color-soft-soil)", letterSpacing: "0.1em", opacity: vis * 0.4,
      }}>Aria Space · A Personal Archive</p>
    </section>
  );
}
