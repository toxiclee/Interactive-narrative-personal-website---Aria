"use client";

import { useEffect, useRef, useState } from "react";

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(0);

  useEffect(() => {
    function onScroll() {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const t = 1 - Math.max(0, Math.min(1, (rect.top - window.innerHeight * 0.5) / (window.innerHeight * 0.4)));
      setVis(t);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="memory-space"
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center text-center"
      style={{
        minHeight: "80vh",
        padding: "var(--space-xl) var(--container-padding)",
      }}
    >
      <div
        style={{
          opacity: vis,
          transform: `translateY(${(1 - vis) * 30}px) scale(${0.96 + vis * 0.04})`,
        }}
      >
        <div
          style={{
            fontSize: "var(--step-1)",
            color: "var(--color-accent)",
            marginBottom: "var(--space-m)",
            letterSpacing: "0.5em",
            opacity: 0.5,
          }}
        >
          ✦ ✦ ✦
        </div>

        <p
          style={{
            fontFamily: "var(--body-font-family)",
            fontSize: "var(--step--1)",
            color: "var(--color-soft-soil)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "var(--space-s)",
          }}
        >
          Coming soon
        </p>

        <h2
          style={{
            fontFamily: "var(--body-font-family)",
            fontSize: "var(--step-2)",
            fontWeight: 300,
            color: "var(--color-text-main)",
            lineHeight: 1.2,
            maxWidth: "600px",
            marginBottom: "var(--space-m)",
          }}
        >
          Enter My 3D Memory Space
        </h2>

        <p
          style={{
            fontFamily: "var(--body-font-family)",
            fontSize: "var(--step-0)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "var(--color-text-soft)",
            lineHeight: 1.7,
            maxWidth: "420px",
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "var(--space-l)",
          }}
        >
          A room you can walk through. Memories on the walls. Sounds in the air.
          An immersive archive, built in three dimensions.
        </p>

        <button
          className="group relative"
          style={{
            fontFamily: "var(--body-font-family)",
            fontSize: "var(--step--1)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--color-text-main)",
            background: "transparent",
            border: "1px solid var(--color-accent)",
            borderRadius: "var(--radius-card)",
            padding: "var(--space-s) var(--space-l)",
            cursor: "pointer",
            transition: "var(--transition-slow)",
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
        >
          Explore the Space
        </button>
      </div>

      <footer
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
        style={{
          padding: "var(--space-m) var(--container-padding)",
          opacity: vis * 0.5,
        }}
      >
        <p
          style={{
            fontFamily: "var(--body-font-family)",
            fontSize: "var(--step--1)",
            color: "var(--color-soft-soil)",
            letterSpacing: "0.1em",
          }}
        >
          Aria Space · A Personal Archive
        </p>
      </footer>
    </section>
  );
}
