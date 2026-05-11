"use client";

import { useEffect, useRef, useState } from "react";
import SceneOpening from "./SceneOpening";
import SceneRoom from "./SceneRoom";

export default function NarrativeScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollableHeight =
        containerRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      setProgress(p);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const warmth = Math.min(1, progress * 1.5);
  const bgLightness = 98 - progress * 2;
  const vignetteStrength = 0.03 + progress * 0.04;

  return (
    <div
      ref={containerRef}
      style={{ height: "200vh", position: "relative" }}
    >
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{
          height: "100vh",
          background: `hsl(40, ${6 + warmth * 4}%, ${bgLightness}%)`,
        }}
      >
        {/* Continuous ambient wash that evolves with scroll */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at ${62 - progress * 12}% ${38 + progress * 12}%, 
                rgba(255,253,250,${0.5 - progress * 0.15}) 0%, transparent 60%),
              radial-gradient(ellipse at ${35 + progress * 15}% ${55 - progress * 5}%, 
                rgba(252,250,247,${0.2 + progress * 0.1}) 0%, transparent 50%)
            `,
          }}
        />

        {/* Evolving vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(220,215,210,${vignetteStrength}) 100%),
              linear-gradient(to bottom, rgba(240,238,235,${0.02 + progress * 0.02}) 0%, transparent 15%, transparent 85%, rgba(240,238,235,${0.03 + progress * 0.02}) 100%)
            `,
            zIndex: 2,
          }}
        />

        {/* Scene layers — overlapping, continuous */}
        <SceneOpening progress={progress} />
        <SceneRoom progress={progress} />
      </div>
    </div>
  );
}
