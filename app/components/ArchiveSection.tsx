"use client";

import { useEffect, useRef, useState } from "react";

interface Theme {
  label: string;
  count: number;
  description: string;
}

const themes: Theme[] = [
  { label: "Places I\u2019ve Been", count: 24, description: "Cities, rooms, forests, coastlines \u2014 spaces that shaped something." },
  { label: "Things I\u2019ve Made", count: 18, description: "Projects, tools, experiments \u2014 the quiet work of building." },
  { label: "Words I\u2019ve Kept", count: 31, description: "Notes, letters, fragments \u2014 writings that stayed with me." },
  { label: "Light I\u2019ve Caught", count: 42, description: "Photographs at golden hour, in fog, under trees." },
  { label: "Sounds I Remember", count: 12, description: "Field recordings, ambient pieces, music from certain moments." },
  { label: "People I\u2019ve Met", count: 8, description: "Portraits, conversations, brief encounters worth remembering." },
];

function ThemeRow({ theme, index }: { theme: Theme; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [vis, setVis] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const t = 1 - Math.max(0, Math.min(1, (rect.top - window.innerHeight * 0.8) / (window.innerHeight * 0.2)));
      setVis(t);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      ref={ref}
      href="#"
      className="group block"
      style={{
        padding: "var(--space-m) 0",
        borderBottom: "1px solid rgba(184,168,152,0.15)",
        opacity: vis,
        transform: `translateY(${(1 - vis) * 20}px)`,
        textDecoration: "none",
        transition: `padding 0.4s ease, background 0.4s ease`,
        transitionDelay: `${index * 0.03}s`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.paddingLeft = "var(--space-s)";
        e.currentTarget.style.background = "rgba(245,243,239,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.paddingLeft = "0";
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3
            style={{
              fontFamily: "var(--body-font-family)",
              fontSize: "var(--step-1)",
              fontWeight: 400,
              color: "var(--color-text-main)",
              lineHeight: 1.4,
            }}
          >
            {theme.label}
          </h3>
          <p
            style={{
              fontFamily: "var(--body-font-family)",
              fontSize: "var(--step--1)",
              color: "var(--color-text-soft)",
              lineHeight: 1.5,
              marginTop: "4px",
            }}
          >
            {theme.description}
          </p>
        </div>
        <span
          style={{
            fontFamily: "var(--body-font-family)",
            fontSize: "var(--step--1)",
            color: "var(--color-soft-soil)",
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
        >
          {theme.count} entries
        </span>
      </div>
    </a>
  );
}

export default function ArchiveSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(0);

  useEffect(() => {
    function onScroll() {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const t = 1 - Math.max(0, Math.min(1, (rect.top - window.innerHeight * 0.6) / (window.innerHeight * 0.4)));
      setVis(t);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="archive"
      ref={sectionRef}
      style={{ padding: "var(--space-xl) var(--container-padding)" }}
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="flex flex-col items-center text-center"
          style={{
            marginBottom: "var(--space-xl)",
            opacity: vis,
            transform: `translateY(${(1 - vis) * 25}px)`,
          }}
        >
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
            Browse by theme
          </p>
          <h2
            style={{
              fontFamily: "var(--body-font-family)",
              fontSize: "var(--step-2)",
              fontWeight: 300,
              color: "var(--color-text-main)",
              lineHeight: 1.1,
            }}
          >
            The Archive
          </h2>
        </div>

        <div>
          {themes.map((theme, i) => (
            <ThemeRow key={theme.label} theme={theme} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
