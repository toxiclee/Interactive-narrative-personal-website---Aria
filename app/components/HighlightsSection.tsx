"use client";

import { useEffect, useRef, useState } from "react";

interface HighlightCard {
  title: string;
  category: string;
  description: string;
}

const highlights: HighlightCard[] = [
  {
    title: "Morning in Kyoto",
    category: "Photography",
    description:
      "A series captured at dawn — temples wrapped in fog, streets before the world wakes.",
  },
  {
    title: "The Listening Room",
    category: "Memory Space",
    description:
      "An interactive space where sound meets place. Built from recordings gathered over three years.",
  },
  {
    title: "Field Notes",
    category: "Writing",
    description:
      "Short observations from walks, train rides, and quiet afternoons. Unfinished thoughts, preserved.",
  },
  {
    title: "Small Tools",
    category: "Projects",
    description:
      "A collection of tiny utilities — things I built to make my own creative process a little easier.",
  },
];

function Card({ item, index }: { item: HighlightCard; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const t = 1 - Math.max(0, Math.min(1, (rect.top - window.innerHeight * 0.75) / (window.innerHeight * 0.3)));
      setVis(t);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <article
      ref={ref}
      className="group cursor-pointer"
      style={{
        background: "rgba(245,243,239,0.5)",
        borderRadius: "var(--radius-card)",
        padding: "var(--space-m)",
        opacity: vis,
        transform: `translateY(${(1 - vis) * 40}px)`,
        transitionDelay: `${index * 0.05}s`,
        willChange: "transform, opacity",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `translateY(${(1 - vis) * 40}px)`;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          background: "linear-gradient(135deg, var(--color-paper), var(--color-warm-cream))",
          borderRadius: "var(--radius-card)",
          marginBottom: "var(--space-s)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: "var(--color-accent)", fontSize: "var(--step--1)", letterSpacing: "0.1em" }}
        >
          ✦
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--body-font-family)",
          fontSize: "var(--step--1)",
          color: "var(--color-soft-soil)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "var(--space-xs)",
        }}
      >
        {item.category}
      </p>

      <h3
        style={{
          fontFamily: "var(--body-font-family)",
          fontSize: "var(--step-1)",
          fontWeight: 400,
          color: "var(--color-text-main)",
          lineHeight: 1.3,
          marginBottom: "var(--space-xs)",
        }}
      >
        {item.title}
      </h3>

      <p
        style={{
          fontFamily: "var(--body-font-family)",
          fontSize: "var(--step--1)",
          color: "var(--color-text-soft)",
          lineHeight: 1.6,
        }}
      >
        {item.description}
      </p>
    </article>
  );
}

export default function HighlightsSection() {
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
      ref={sectionRef}
      style={{
        padding: "var(--space-xl) var(--container-padding)",
        paddingTop: "0",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div
          className="flex flex-col items-center text-center"
          style={{
            marginBottom: "var(--space-xl)",
            opacity: vis,
            transform: `translateY(${(1 - vis) * 30}px)`,
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
            Selected
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
            Featured Highlights
          </h2>
        </div>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
        >
          {highlights.map((item, i) => (
            <Card key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
