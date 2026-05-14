"use client";

import Image from "next/image";
import {
  LANDING_FINAL_SCALE,
  openingZoomT,
  roomSlideT,
} from "./landingPhases";

export default function SceneOpening({ progress }: { progress: number }) {
  const zoomT = openingZoomT(progress);
  const slideT = roomSlideT(progress);

  const scale = 1 + zoomT * (LANDING_FINAL_SCALE - 1);
  const slideXvw = slideT * 14;

  const heroOpacity =
    slideT < 0.78 ? 1 : Math.max(0, 1 - (slideT - 0.78) / 0.22);

  const quoteOpacity = Math.min(
    1,
    Math.max(0, (slideT - 0.06) / 0.22),
  );

  const spatialBreath = progress * 0.85;
  const aerialBlur = Math.min(1.1, Math.max(0, (progress - 0.42) * 2.2));

  return (
    <div
      className="absolute inset-0"
      style={{ opacity: heroOpacity, willChange: "opacity" }}
    >
      {/* One image: zoom first, then horizontal move from the exact same frame */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "50% 45%",
          transition:
            "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1), transform-origin 0.75s cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
          filter: `brightness(${1 - spatialBreath * 0.06}) saturate(${0.72 - spatialBreath * 0.08}) hue-rotate(-5deg) blur(${aerialBlur}px)`,
        }}
      >
        <div
          className="absolute inset-y-0"
          style={{
            width: "122%",
            left: "-11%",
            transform: `translateX(${slideXvw}vw)`,
            transition:
              "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
          }}
        >
          <div className="absolute inset-0">
            <Image
              src="/landingpage.png"
              alt="Ballet rehearsal studio"
              fill
              priority
              className="object-cover"
              style={{ objectPosition: "center center" }}
            />
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: progress < 0.03 ? 1 : Math.max(0, 1 - (progress - 0.03) / 0.1),
          transition: "opacity 0.35s ease-out",
        }}
      >
        <span className="animate-pulse-soft" style={{
          fontFamily: "var(--body-font-family)", fontSize: "clamp(0.65rem, 0.75vw, 0.8rem)",
          color: "var(--color-text-main)", letterSpacing: "0.2em",
          textTransform: "uppercase", opacity: 0.45,
          textShadow: "0 1px 4px rgba(245,235,220,0.5)",
        }}>
          Scroll to enter
        </span>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 1, opacity: quoteOpacity, transition: "opacity 0.45s ease-out" }}
      >
        <p style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step-1)",
          fontWeight: 300, fontStyle: "italic", color: "var(--color-text-main)",
          maxWidth: "480px", textAlign: "center", lineHeight: 1.8,
          letterSpacing: "0.03em", padding: "0 var(--space-m)",
          textShadow: `
            0 1px 10px rgba(245,235,220,0.85),
            0 18px 42px rgba(120, 100, 88, ${0.08 + progress * 0.06}),
            0 0 80px rgba(255, 252, 248, ${0.25 + progress * 0.15})
          `,
          transform: `translateZ(${6 + progress * 10}px)`,
          transformStyle: "preserve-3d",
        }}>
          Some memories are easier to enter than explain.
        </p>
      </div>
    </div>
  );
}
