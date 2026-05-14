"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CorridorNavProvider } from "./photography/corridorNavContext";

const GalleryCorridorCanvas = dynamic(
  () => import("./photography/GalleryCorridorScene"),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0"
        style={{ background: "var(--color-warm-cream)" }}
        aria-hidden
      />
    ),
  },
);

export default function PhotographyCorridor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    function handleScroll() {
      if (!mounted || !containerRef.current) return;
      const scrollable = containerRef.current.offsetHeight - window.innerHeight;
      const scrolled = -containerRef.current.getBoundingClientRect().top;
      const p = Math.max(0, Math.min(1, scrolled / Math.max(1, scrollable)));
      progressRef.current = p;
      requestAnimationFrame(() => {
        if (mounted) setProgress(p);
      });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    const id = requestAnimationFrame(handleScroll);
    return () => {
      mounted = false;
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const hudFade = Math.max(0, 1 - (progress - 0.05) / 0.12);

  return (
    <div
      ref={containerRef}
      style={{
        height: "min(720vh, 8200px)",
        position: "relative",
      }}
    >
      <section
        className="sticky top-0 w-full overflow-hidden"
        style={{
          height: "100vh",
          background: "var(--color-warm-cream)",
        }}
      >
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-20 px-[var(--container-padding)] pt-[clamp(1rem,4vh,2rem)]"
          style={{ opacity: hudFade * 0.58 }}
        >
          <p
            style={{
              fontFamily: "var(--body-font-family)",
              fontSize: "var(--step--1)",
              color: "var(--color-soft-soil)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Photography
          </p>
        </div>

        <CorridorNavProvider mouseRef={mouseRef}>
          <div
            className="absolute inset-0 z-1"
            style={{ touchAction: "none", cursor: "default" }}
          >
            <GalleryCorridorCanvas progressRef={progressRef} />
          </div>
        </CorridorNavProvider>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: `
              radial-gradient(ellipse at 50% 40%, transparent 48%, rgba(255, 248, 238, 0.18) 100%),
              linear-gradient(90deg, rgba(255, 242, 228, 0.04) 0%, transparent 14%, transparent 86%, rgba(255, 236, 220, 0.05) 100%)
            `,
          }}
        />

        <div
          className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
          style={{
            width: 50,
            height: 2,
            borderRadius: 1,
            background: "rgba(141, 130, 119, 0.18)",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              borderRadius: 1,
              background: "var(--color-soft-soil)",
              opacity: 0.32,
            }}
          />
        </div>
      </section>
    </div>
  );
}
