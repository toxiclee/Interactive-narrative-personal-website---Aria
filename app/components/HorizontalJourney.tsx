"use client";

import { useEffect, useRef, useState } from "react";

const PANEL_COUNT = 5;

function LetterPanel({ panelProgress }: { panelProgress: number }) {
  const vis = Math.min(1, panelProgress * 3);
  return (
    <div className="relative w-screen h-full shrink-0 flex items-center justify-center">
      {/* Ambient environment remnants */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
        <svg viewBox="0 0 1600 900" className="w-full h-full" preserveAspectRatio="xMidYMid slice" fill="none">
          {[300, 500, 700, 900, 1100, 1300].map((x, i) => (
            <line key={`fl-${i}`} x1={x} y1={900} x2={800 + (x - 800) * 0.15} y2={200}
              stroke="#a09080" strokeWidth={0.5} opacity={0.5} />
          ))}
          <circle cx="300" cy="350" r="250" fill="#f5eee4" opacity="0.04" />
        </svg>
      </div>

      <div
        className="relative max-w-xl w-full mx-auto px-8"
        style={{ opacity: vis, transform: `translateY(${(1 - vis) * 30}px)` }}
      >
        <div style={{
          background: "rgba(245,243,239,0.75)",
          borderRadius: "var(--radius-card)",
          padding: "var(--space-xl) var(--space-l)",
          boxShadow: "0 2px 60px rgba(0,0,0,0.03)",
          backdropFilter: "blur(6px)",
        }}>
          <div style={{ width: 30, height: 1, background: "var(--color-accent)", marginBottom: "var(--space-m)", opacity: 0.4 }} />
          <p style={{
            fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
            color: "var(--color-soft-soil)", letterSpacing: "0.18em",
            textTransform: "uppercase", marginBottom: "var(--space-m)",
          }}>From the archive</p>
          <div style={{
            fontFamily: "var(--body-font-family)", fontSize: "var(--step-1)",
            fontWeight: 300, color: "var(--color-text-main)", lineHeight: 1.9,
          }}>
            <p style={{ fontStyle: "italic", marginBottom: "var(--space-m)" }}>Dear visitor,</p>
            <p style={{ marginBottom: "var(--space-s)" }}>
              This is a quiet place. A collection of memories I&apos;ve gathered over the years —
              photographs taken in the early morning, projects built in solitude,
              writings from moments I didn&apos;t want to forget.
            </p>
            <p style={{ marginBottom: "var(--space-s)" }}>
              Nothing here is meant to impress. Everything here is meant to remember.
            </p>
            <p style={{ marginBottom: "var(--space-m)" }}>Welcome to my archive.</p>
            <p style={{ fontStyle: "italic", color: "var(--color-soft-soil)" }}>— Aria</p>
          </div>
          <div style={{ width: 30, height: 1, background: "var(--color-accent)", marginTop: "var(--space-l)", opacity: 0.4 }} />
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-12 animate-pulse-soft" style={{
        fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
        color: "var(--color-soft-soil)", letterSpacing: "0.15em", opacity: 0.35,
      }}>
        ← continue →
      </div>
    </div>
  );
}

function PhotographyPanel({ panelProgress }: { panelProgress: number }) {
  const vis = Math.min(1, Math.max(0, panelProgress) * 2.5);

  const photos = [
    { title: "Morning in Kyoto", desc: "Temples in fog, before the world wakes", aspect: "3/4" },
    { title: "The Blue Hour", desc: "That brief silence between day and night", aspect: "4/3" },
    { title: "Rain on Glass", desc: "A window in Copenhagen, November", aspect: "2/3" },
    { title: "Empty Stage", desc: "After the last rehearsal", aspect: "4/3" },
    { title: "First Snow", desc: "The courtyard, just before dawn", aspect: "3/4" },
    { title: "Afternoon Light", desc: "A room in Lisbon, golden hour", aspect: "1/1" },
  ];

  return (
    <div className="relative w-screen h-full shrink-0 flex items-center">
      <div className="w-full" style={{ padding: "0 var(--container-padding)" }}>
        <div className="flex flex-col items-start" style={{ marginBottom: "var(--space-l)" }}>
          <p style={{
            fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
            color: "var(--color-soft-soil)", letterSpacing: "0.15em",
            textTransform: "uppercase", marginBottom: "var(--space-xs)",
            opacity: vis, transform: `translateX(${(1 - vis) * 40}px)`,
          }}>Photography</p>
        </div>

        <div className="flex gap-5 items-end" style={{ height: "55vh" }}>
          {photos.map((photo, i) => {
            const delay = i * 0.08;
            const itemVis = Math.min(1, Math.max(0, vis - delay) / (1 - delay));
            return (
              <div
                key={photo.title}
                className="group cursor-pointer shrink-0"
                style={{
                  width: "clamp(160px, 14vw, 220px)",
                  aspectRatio: photo.aspect,
                  background: "linear-gradient(145deg, var(--color-paper), var(--color-almond))",
                  borderRadius: "var(--radius-card)",
                  position: "relative",
                  overflow: "hidden",
                  opacity: itemVis,
                  transform: `translateY(${(1 - itemVis) * 30}px)`,
                  transition: "box-shadow 0.4s ease, transform 0.4s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = `translateY(${(1 - itemVis) * 30}px)`;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ color: "var(--color-accent)", fontSize: "var(--step--1)", opacity: 0.3 }}>✦</div>
                <div className="absolute bottom-0 left-0 right-0 p-3"
                  style={{ background: "linear-gradient(to top, rgba(245,240,235,0.9), transparent)" }}>
                  <p style={{
                    fontFamily: "var(--body-font-family)", fontSize: "clamp(0.7rem, 0.8vw, 0.85rem)",
                    fontWeight: 400, color: "var(--color-text-main)", lineHeight: 1.3,
                  }}>{photo.title}</p>
                  <p style={{
                    fontFamily: "var(--body-font-family)", fontSize: "clamp(0.6rem, 0.7vw, 0.75rem)",
                    color: "var(--color-text-soft)", marginTop: 2, lineHeight: 1.3,
                  }}>{photo.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProjectsPanel({ panelProgress }: { panelProgress: number }) {
  const vis = Math.min(1, Math.max(0, panelProgress) * 2.5);

  const projects = [
    { title: "The Listening Room", type: "Interactive", desc: "An immersive space where sound meets place. Built from recordings gathered over three years." },
    { title: "Small Tools", type: "Utilities", desc: "A collection of tiny utilities — things I built to make my own creative process a little easier." },
    { title: "Field Notes", type: "Writing", desc: "Short observations from walks, train rides, and quiet afternoons." },
    { title: "Archive Engine", type: "System", desc: "The system behind this archive. A quiet tool for organizing memories." },
  ];

  return (
    <div className="relative w-screen h-full shrink-0 flex items-center">
      <div className="w-full max-w-4xl mx-auto" style={{ padding: "0 var(--container-padding)" }}>
        <div className="flex flex-col items-start" style={{ marginBottom: "var(--space-l)" }}>
          <p style={{
            fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
            color: "var(--color-soft-soil)", letterSpacing: "0.15em",
            textTransform: "uppercase", marginBottom: "var(--space-xs)",
            opacity: vis,
          }}>Projects</p>
          <h2 style={{
            fontFamily: "var(--body-font-family)", fontSize: "var(--step-2)",
            fontWeight: 300, color: "var(--color-text-main)", lineHeight: 1.1,
            opacity: vis,
          }}>Things I&apos;ve Made</h2>
        </div>

        <div className="flex flex-col gap-0">
          {projects.map((project, i) => {
            const delay = i * 0.1;
            const itemVis = Math.min(1, Math.max(0, vis - delay) / (1 - delay));
            return (
              <a key={project.title} href="#" className="group block"
                style={{
                  padding: "var(--space-m) 0",
                  borderBottom: "1px solid rgba(184,168,152,0.12)",
                  textDecoration: "none",
                  opacity: itemVis,
                  transform: `translateX(${(1 - itemVis) * 30}px)`,
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
                    }}>{project.title}</h3>
                    <p style={{
                      fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
                      color: "var(--color-text-soft)", lineHeight: 1.5, marginTop: 4, maxWidth: 420,
                    }}>{project.desc}</p>
                  </div>
                  <span style={{
                    fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
                    color: "var(--color-soft-soil)", letterSpacing: "0.08em",
                    whiteSpace: "nowrap", textTransform: "uppercase",
                  }}>{project.type}</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ArchivePanel({ panelProgress }: { panelProgress: number }) {
  const vis = Math.min(1, Math.max(0, panelProgress) * 2.5);

  const themes = [
    { label: "Places", count: 24 }, { label: "Light", count: 42 },
    { label: "Words", count: 31 }, { label: "Sound", count: 12 },
    { label: "Making", count: 18 }, { label: "People", count: 8 },
  ];

  return (
    <div className="relative w-screen h-full shrink-0 flex items-center justify-center">
      <div className="text-center" style={{ maxWidth: 600, padding: "0 var(--space-m)" }}>
        <p style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
          color: "var(--color-soft-soil)", letterSpacing: "0.15em",
          textTransform: "uppercase", marginBottom: "var(--space-s)",
          opacity: vis,
        }}>Browse by theme</p>
        <h2 style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step-2)",
          fontWeight: 300, color: "var(--color-text-main)", lineHeight: 1.1,
          marginBottom: "var(--space-xl)", opacity: vis,
        }}>The Archive</h2>

        <div className="grid grid-cols-3 gap-4">
          {themes.map((theme, i) => {
            const delay = i * 0.06;
            const itemVis = Math.min(1, Math.max(0, vis - delay) / (1 - delay));
            return (
              <a key={theme.label} href="#" className="group"
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "var(--space-m) var(--space-s)",
                  background: "rgba(245,243,239,0.4)",
                  borderRadius: "var(--radius-card)",
                  textDecoration: "none",
                  opacity: itemVis,
                  transform: `scale(${0.9 + itemVis * 0.1})`,
                  transition: "background 0.4s ease, transform 0.4s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(245,243,239,0.7)";
                  e.currentTarget.style.transform = "scale(1.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(245,243,239,0.4)";
                  e.currentTarget.style.transform = `scale(${0.9 + itemVis * 0.1})`;
                }}
              >
                <span style={{
                  fontFamily: "var(--body-font-family)", fontSize: "var(--step-1)",
                  fontWeight: 300, color: "var(--color-text-main)",
                }}>{theme.count}</span>
                <span style={{
                  fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
                  color: "var(--color-soft-soil)", letterSpacing: "0.1em",
                  textTransform: "uppercase", marginTop: 4,
                }}>{theme.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MemorySpacePanel({ panelProgress }: { panelProgress: number }) {
  const vis = Math.min(1, Math.max(0, panelProgress) * 2);

  return (
    <div className="relative w-screen h-full shrink-0 flex flex-col items-center justify-center text-center">
      <div style={{
        opacity: vis,
        transform: `translateY(${(1 - vis) * 20}px) scale(${0.96 + vis * 0.04})`,
        maxWidth: 520, padding: "0 var(--space-m)",
      }}>
        <div style={{
          fontSize: "var(--step-1)", color: "var(--color-accent)",
          marginBottom: "var(--space-m)", letterSpacing: "0.5em", opacity: 0.4,
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
        position: "absolute", bottom: "var(--space-m)",
        fontFamily: "var(--body-font-family)", fontSize: "var(--step--1)",
        color: "var(--color-soft-soil)", letterSpacing: "0.1em", opacity: vis * 0.4,
      }}>Aria Space · A Personal Archive</p>
    </div>
  );
}

export default function HorizontalJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollable = containerRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.max(0, Math.min(1, scrolled / scrollable)));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const translateX = -progress * (PANEL_COUNT - 1) * 100;

  const panelProgress = (index: number) => {
    const panelStart = index / PANEL_COUNT;
    const panelEnd = (index + 1) / PANEL_COUNT;
    return (progress - panelStart) / (panelEnd - panelStart);
  };

  return (
    <div
      ref={containerRef}
      style={{ height: `${PANEL_COUNT * 100}vh`, position: "relative" }}
    >
      <div
        className="sticky top-0 w-screen overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Horizontal track */}
        <div
          className="flex h-full"
          style={{
            width: `${PANEL_COUNT * 100}vw`,
            transform: `translateX(${translateX}vw)`,
            willChange: "transform",
          }}
        >
          <LetterPanel panelProgress={panelProgress(0)} />
          <PhotographyPanel panelProgress={panelProgress(1)} />
          <ProjectsPanel panelProgress={panelProgress(2)} />
          <ArchivePanel panelProgress={panelProgress(3)} />
          <MemorySpacePanel panelProgress={panelProgress(4)} />
        </div>

        {/* Panel progress indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 10 }}>
          {Array.from({ length: PANEL_COUNT }, (_, i) => {
            const active = progress >= i / PANEL_COUNT && progress < (i + 1) / PANEL_COUNT;
            return (
              <div key={`dot-${i}`} style={{
                width: active ? 20 : 6, height: 2,
                background: "var(--color-soft-soil)",
                opacity: active ? 0.5 : 0.15,
                borderRadius: 1,
                transition: "all 0.5s ease",
              }} />
            );
          })}
        </div>

        {/* Continuous soft vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(180,168,152,0.08) 100%),
            linear-gradient(to bottom, rgba(200,190,175,0.04) 0%, transparent 12%, transparent 88%, rgba(200,190,175,0.06) 100%)
          `,
          zIndex: 5,
        }} />
      </div>
    </div>
  );
}
