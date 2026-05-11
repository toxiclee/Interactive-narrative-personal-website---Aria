"use client";

import { useEffect, useRef, useState } from "react";

function ProjectRow({ title, type, desc, delay }: { title: string; type: string; desc: string; delay: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [vis, setVis] = useState(0);

  useEffect(() => {
    function handleScroll() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const v = Math.max(0, Math.min(1, 1 - rect.top / (window.innerHeight * 0.85)));
      setVis(Math.max(0, Math.min(1, (v - delay) / (1 - delay))));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [delay]);

  return (
    <a
      ref={ref}
      href="#"
      className="group block"
      style={{
        padding: "var(--space-m) 0",
        borderBottom: "1px solid rgba(184,168,152,0.12)",
        textDecoration: "none",
        opacity: vis,
        transform: `translateY(${(1 - vis) * 20}px)`,
        transition: "padding-left 0.4s ease, background 0.4s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.paddingLeft = "var(--space-s)";
        e.currentTarget.style.background = "rgba(245,243,239,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.paddingLeft = "0";
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 style={{
            fontFamily: "var(--body-font-family)", fontSize: "var(--step-1)",
            fontWeight: 400, color: "var(--color-text-main)", lineHeight: 1.4,
          }}>{title}</h3>
          <p style={{
            fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
            color: "var(--color-text-soft)", lineHeight: 1.5, marginTop: 4, maxWidth: 480,
          }}>{desc}</p>
        </div>
        <span style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
          color: "var(--color-soft-soil)", letterSpacing: "0.08em",
          whiteSpace: "nowrap", textTransform: "uppercase",
        }}>{type}</span>
      </div>
    </a>
  );
}

export default function ProjectsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(0);

  useEffect(() => {
    function handleScroll() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setVis(Math.max(0, Math.min(1, 1 - rect.top / (window.innerHeight * 0.8))));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const projects = [
    { title: "The Listening Room", type: "Interactive", desc: "An immersive space where sound meets place. Built from recordings gathered over three years." },
    { title: "Small Tools", type: "Utilities", desc: "A collection of tiny utilities — things I built to make my own creative process easier." },
    { title: "Field Notes", type: "Writing", desc: "Short observations from walks, train rides, and quiet afternoons." },
    { title: "Archive Engine", type: "System", desc: "The system behind this archive. A quiet tool for organizing memories." },
  ];

  return (
    <section ref={ref} style={{ padding: "var(--space-xl) var(--container-padding)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div className="max-w-3xl mx-auto w-full">
        <div style={{ marginBottom: "var(--space-l)" }}>
          <p style={{
            fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
            color: "var(--color-soft-soil)", letterSpacing: "0.15em",
            textTransform: "uppercase", marginBottom: "var(--space-xs)",
            opacity: vis,
          }}>Projects</p>
          <h2 style={{
            fontFamily: "var(--body-font-family)", fontSize: "var(--step-2)",
            fontWeight: 300, color: "var(--color-text-main)", lineHeight: 1.1,
            opacity: vis, transform: `translateY(${(1 - vis) * 20}px)`,
          }}>Things I&apos;ve Made</h2>
        </div>

        <div className="flex flex-col">
          {projects.map((project, i) => (
            <ProjectRow key={project.title} {...project} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
