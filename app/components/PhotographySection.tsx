"use client";

import { useEffect, useRef, useState } from "react";

function PhotoCard({ title, desc, aspect, delay }: { title: string; desc: string; aspect: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
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
    <div
      ref={ref}
      className="group cursor-pointer"
      style={{
        aspectRatio: aspect,
        background: "linear-gradient(145deg, var(--color-paper), var(--color-almond))",
        borderRadius: "var(--radius-card)",
        position: "relative",
        overflow: "hidden",
        opacity: vis,
        transform: `translateY(${(1 - vis) * 30}px)`,
        transition: "box-shadow 0.4s ease",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center"
        style={{ color: "var(--color-accent)", fontSize: "var(--step--1)", opacity: 0.25 }}>✦</div>
      <div className="absolute bottom-0 left-0 right-0 p-4"
        style={{ background: "linear-gradient(to top, rgba(245,240,235,0.95), transparent)" }}>
        <p style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
          fontWeight: 400, color: "var(--color-text-main)", lineHeight: 1.3,
        }}>{title}</p>
        <p style={{
          fontFamily: "var(--body-font-family)", fontSize: "clamp(0.7rem, 0.8vw, 0.8rem)",
          color: "var(--color-text-soft)", marginTop: 3,
        }}>{desc}</p>
      </div>
    </div>
  );
}

export default function PhotographySection() {
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

  const photos = [
    { title: "Morning in Kyoto", desc: "Temples in fog, before the world wakes", aspect: "3/4" },
    { title: "The Blue Hour", desc: "That brief silence between day and night", aspect: "4/3" },
    { title: "Rain on Glass", desc: "A window in Copenhagen, November", aspect: "2/3" },
    { title: "Empty Stage", desc: "After the last rehearsal", aspect: "4/3" },
    { title: "First Snow", desc: "The courtyard, just before dawn", aspect: "3/4" },
    { title: "Afternoon Light", desc: "A room in Lisbon, golden hour", aspect: "1/1" },
  ];

  return (
    <section ref={ref} style={{ padding: "var(--space-xl) var(--container-padding)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ marginBottom: "var(--space-l)" }}>
        <p style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
          color: "var(--color-soft-soil)", letterSpacing: "0.15em",
          textTransform: "uppercase", marginBottom: "var(--space-xs)",
          opacity: vis,
        }}>Photography</p>
        <h2 style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step-2)",
          fontWeight: 300, color: "var(--color-text-main)", lineHeight: 1.1,
          opacity: vis, transform: `translateY(${(1 - vis) * 20}px)`,
        }}>Light I&apos;ve Caught</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {photos.map((photo, i) => (
          <PhotoCard key={photo.title} {...photo} delay={i * 0.06} />
        ))}
      </div>
    </section>
  );
}
