"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  LETTER_TO_PHOTOGRAPHY_IMAGE,
  PHOTOGRAPHY_EXIT_TRANSITION_IMAGE,
} from "./photography/entranceAsset";

// Stronger correction for warm/yellow images — push toward clean white
const imageWarmToWhite: React.CSSProperties = {
  filter: "brightness(1.12) saturate(0.6) sepia(0) hue-rotate(-8deg)",
};

// Minimal adjustment for already-white images (2.png)
const imageNeutral: React.CSSProperties = {
  filter: "brightness(1.02) saturate(0.9)",
};

export type HorizontalTransitionVariant =
  | "letter-to-photography"
  | "dress-closeup"
  | "archive-to-memory";

interface HorizontalTransitionProps {
  variant: HorizontalTransitionVariant;
}

/* Letter → Photography — 2.png (wide horizontal) */
function LetterToPhotographyPainting() {
  return (
    <div
      className="relative"
      style={{ width: "300vw", height: "100%", minWidth: "300vw", ...imageNeutral }}
    >
      <Image src={LETTER_TO_PHOTOGRAPHY_IMAGE} alt="" fill className="object-cover" />
    </div>
  );
}

/* Dress close-up — 1.png */
function DressCloseupPainting({ progress }: { progress: number }) {
  const scale = 1 + progress * 0.28;
  const originX = 50 + progress * 2;
  const originY = 48 + progress * 4;

  return (
    <div className="relative h-full w-full" style={imageWarmToWhite}>
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${originX}% ${originY}%`,
          transition: "transform 0.08s linear",
          willChange: "transform",
        }}
      >
        <Image src={PHOTOGRAPHY_EXIT_TRANSITION_IMAGE} alt="" fill className="object-cover" />
      </div>
    </div>
  );
}

/* Archive → Memory — 4.png */
function ArchiveToMemoryPainting() {
  return (
    <div
      className="relative"
      style={{
        width: "200vw",
        height: "100%",
        minWidth: "200vw",
        filter: "brightness(0.88) saturate(0.75) contrast(1.05)",
      }}
    >
      <Image src="/4.png" alt="" fill className="object-cover" />
    </div>
  );
}

const paintings: Record<HorizontalTransitionVariant, React.FC<{ progress: number }>> = {
  "archive-to-memory": ArchiveToMemoryPainting,
  "dress-closeup": DressCloseupPainting,
  "letter-to-photography": LetterToPhotographyPainting,
};

type TransitionEffect = "vertical-slide" | "dress-zoom" | "scale-gate";

const variantEffects: Record<HorizontalTransitionVariant, TransitionEffect> = {
  "archive-to-memory": "vertical-slide",
  "dress-closeup": "dress-zoom",
  "letter-to-photography": "scale-gate",
};

export default function HorizontalTransition({ variant }: HorizontalTransitionProps) {
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

  const effect = variantEffects[variant];
  const Painting = paintings[variant];

  const enterPhase = Math.min(1, progress / 0.12);
  const exitPhase = progress > 0.88 ? (progress - 0.88) / 0.12 : 0;
  const midProgress = Math.max(0, Math.min(1, (progress - 0.12) / 0.76));
  /** Vignette / chrome — can ease out at the end */
  const shellVisibility = enterPhase * (1 - exitPhase);
  /**
   * Letter → Photography: keep the painting opaque through the seam into the 3D gallery
   * (no exit shrink on the painting layer).
   */
  const paintingOpacity =
    variant === "letter-to-photography" ? enterPhase : shellVisibility;

  let paintingStyle: React.CSSProperties = {};

  const tiltX = (1 - enterPhase) * 4 - exitPhase * 4;
  const tiltY = (midProgress - 0.5) * 2;
  const shadowSpread = 20 + shellVisibility * 30;
  const shadowOpacity = 0.08 * shellVisibility;

  if (effect === "vertical-slide") {
    const enterFromBelow = (1 - enterPhase) * 130;
    const exitUp = exitPhase * 72;
    const z = -18 + midProgress * 36 - exitPhase * 22;
    paintingStyle = {
      transform: `translateZ(${z}px) translateY(${enterFromBelow - exitUp}px) translateX(${-midProgress * 100}%)`,
      opacity: paintingOpacity,
    };
  } else if (effect === "dress-zoom") {
    const z = -10 + midProgress * 42 - exitPhase * 16;
    paintingStyle = {
      transform: `translateZ(${z}px) rotateX(${tiltX * 0.35}deg) rotateY(${tiltY * 0.2}deg)`,
      opacity: paintingOpacity,
    };
  } else if (effect === "scale-gate") {
    /* Letter → Photography: horizontal drift + gentle dolly through depth */
    const z = -14 + enterPhase * 26 + midProgress * 18 - exitPhase * 10;
    paintingStyle = {
      transform: `translateZ(${z}px) translateX(${-midProgress * 150}%) scale(1)`,
      transformOrigin: "50% 50%",
      opacity: paintingOpacity,
    };
  }

  return (
    <div ref={containerRef} style={{ height: "min(240vh, 2200px)", position: "relative" }}>
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{
          height: "100vh",
          perspective: "min(1400px, 120vw)",
          perspectiveOrigin: "50% 42%",
          background:
            variant === "letter-to-photography" ? "var(--color-warm-cream)" : undefined,
        }}
      >
        <div
          className="absolute inset-0 flex items-center"
          style={{
            willChange: "transform, opacity",
          transformStyle: "preserve-3d",
          boxShadow: `0 ${shadowSpread}px ${shadowSpread * 2}px rgba(0,0,0,${shadowOpacity})`,
          ...paintingStyle,
          }}
        >
          <Painting progress={midProgress} />
        </div>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
          background: `
            linear-gradient(to right, rgba(245,240,235,${0.5 * shellVisibility}) 0%, transparent 10%, transparent 90%, rgba(245,240,235,${0.5 * shellVisibility}) 100%),
            linear-gradient(to bottom, rgba(245,240,235,${0.4 * shellVisibility}) 0%, transparent 18%, transparent 82%, rgba(245,240,235,${0.4 * shellVisibility}) 100%)
          `,
            filter: `saturate(${0.92 - exitPhase * 0.08}) blur(${exitPhase * 2.5}px)`,
            opacity: 0.85 + exitPhase * 0.15,
          }}
        />

        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          style={{
            width: 50,
            height: 2,
            borderRadius: 1,
            background: "rgba(160,144,128,0.15)",
            opacity: shellVisibility,
          }}
        >
          <div
            style={{
              width: `${midProgress * 100}%`,
              height: "100%",
              borderRadius: 1,
              background: "var(--color-soft-soil)",
              opacity: 0.4,
            }}
          />
        </div>
      </div>
    </div>
  );
}
