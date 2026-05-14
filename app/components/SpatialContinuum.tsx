"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Global cinematic atmosphere: depth fog, parallax haze, foreground obstruction.
 * Fixed overlay only — no transform on scroll ancestors of sticky sections.
 */
export default function SpatialContinuum() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMq = () => {
      const m = mq.matches;
      reducedMotionRef.current = m;
      setReducedMotion(m);
    };
    syncMq();
    mq.addEventListener("change", syncMq);

    const root = document.documentElement;
    let mx = 0;
    let my = 0;
    let raf = 0;

    const apply = () => {
      raf = 0;
      const maxY = Math.max(1, root.scrollHeight - window.innerHeight);
      const y = window.scrollY;
      const t = Math.max(0, Math.min(1, y / maxY));
      root.style.setProperty("--spatial-y", `${y}px`);
      root.style.setProperty("--spatial-t", String(t));
      root.style.setProperty("--spatial-mx", String(mx));
      root.style.setProperty("--spatial-my", String(my));
    };

    const onScroll = () => {
      if (raf !== 0) return;
      raf = requestAnimationFrame(() => {
        apply();
        raf = 0;
      });
    };

    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      my = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      if (reducedMotionRef.current) return;
      if (raf !== 0) return;
      raf = requestAnimationFrame(() => {
        apply();
        raf = 0;
      });
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      mq.removeEventListener("change", syncMq);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
      root.style.removeProperty("--spatial-y");
      root.style.removeProperty("--spatial-t");
      root.style.removeProperty("--spatial-mx");
      root.style.removeProperty("--spatial-my");
    };
  }, []);

  const parallax = (factor: string) =>
    reducedMotion
      ? undefined
      : {
          transform: `translate3d(calc(var(--spatial-mx, 0) * 6px), calc(${factor} * var(--spatial-y, 0px)), 0)`,
        };

  return (
    <div
      className="spatial-continuum pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden
      style={{ zIndex: 0 }}
    >
      {/* Deep background — color temperature drifts with journey */}
      <div
        className="spatial-continuum-layer absolute inset-0"
        style={{
          zIndex: 0,
          background: `
            radial-gradient(ellipse 120% 80% at 50% calc(42% + var(--spatial-t, 0) * 18%),
              rgba(255, 252, 248, 0.55) 0%,
              transparent 55%),
            radial-gradient(ellipse 90% 70% at calc(28% + var(--spatial-t, 0) * 20%) 55%,
              rgba(245, 238, 228, 0.35) 0%,
              transparent 50%),
            linear-gradient(
              165deg,
              hsl(38, 28%, calc(97% - var(--spatial-t, 0) * 3%)) 0%,
              hsl(32, 18%, calc(94% - var(--spatial-t, 0) * 2%)) 45%,
              hsl(28, 14%, calc(91% - var(--spatial-t, 0) * 1.5%)) 100%
            )
          `,
          opacity: 0.85,
          ...parallax("-0.02"),
        }}
      />

      {/* Midground haze — atmospheric perspective */}
      <div
        className="spatial-continuum-layer absolute inset-0"
        style={{
          zIndex: 1,
          background: `
            linear-gradient(
              to bottom,
              rgba(255, 253, 250, 0.22) 0%,
              transparent 22%,
              transparent 62%,
              rgba(238, 230, 220, calc(0.12 + var(--spatial-t, 0) * 0.14)) 100%
            ),
            radial-gradient(ellipse 85% 55% at 50% 48%,
              transparent 30%,
              rgba(210, 200, 188, calc(0.06 + var(--spatial-t, 0) * 0.08)) 100%)
          `,
          mixBlendMode: "multiply",
          ...parallax("-0.045"),
        }}
      />

      {/* Cinematic vignette + lens falloff */}
      <div
        className="spatial-continuum-layer absolute inset-0"
        style={{
          zIndex: 2,
          boxShadow: `
            inset 0 0 120px rgba(55, 48, 42, calc(0.04 + var(--spatial-t, 0) * 0.05)),
            inset 0 0 280px rgba(35, 30, 26, calc(0.02 + var(--spatial-t, 0) * 0.04))
          `,
          ...parallax("-0.03"),
        }}
      />

      {/* Foreground obstruction — edges + floor plane drifting slower than scroll */}
      <div
        className="spatial-continuum-layer absolute inset-0"
        style={{
          zIndex: 3,
          background: `
            linear-gradient(to right,
              rgba(42, 36, 32, calc(0.07 + var(--spatial-t, 0) * 0.04)) 0%,
              transparent 12%,
              transparent 88%,
              rgba(42, 36, 32, calc(0.07 + var(--spatial-t, 0) * 0.04)) 100%),
            linear-gradient(to top,
              rgba(32, 28, 26, calc(0.18 + var(--spatial-t, 0) * 0.1)) 0%,
              rgba(32, 28, 26, 0.05) 22%,
              transparent 48%)
          `,
          ...parallax("-0.09"),
        }}
      />

      {/* Soft top veil - passing under memory architecture */}
      <div
        className="spatial-continuum-layer absolute left-0 right-0 top-0 h-[min(38vh,320px)]"
        style={{
          zIndex: 4,
          background:
            "linear-gradient(to bottom, rgba(252, 249, 245, 0.42) 0%, transparent 100%)",
          filter: reducedMotion ? undefined : "blur(0.5px)",
          opacity: "calc(0.55 + var(--spatial-t, 0) * 0.25)",
          transform: reducedMotion
            ? undefined
            : "translate3d(calc(var(--spatial-mx, 0) * -4px), calc(-0.06 * var(--spatial-y, 0px)), 0)",
        }}
      />
    </div>
  );
}
