"use client";

import Image from "next/image";

export default function SceneRoom({ progress }: { progress: number }) {
  const local = Math.max(0, Math.min(1, (progress - 0.25) / 0.4));
  const fadeIn = Math.min(1, local / 0.3);
  const fadeOut = local > 0.7 ? 1 - (local - 0.7) / 0.3 : 1;
  const opacity = Math.max(0, fadeIn * fadeOut);

  // Second zoom layer — picks up from 1.5× and pushes deep to 2.8×
  const scale = 1.5 + local * 1.3;
  // Pan toward the center dancer's dress/tutu area
  const panX = 50 + local * 2;
  const panY = 48 + local * 12;

  return (
    <div
      className="absolute inset-0"
      style={{ opacity, willChange: "opacity" }}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${panX}% ${panY}%`,
          transition: "transform 0.08s linear",
          willChange: "transform",
          filter: "brightness(1.0) saturate(0.7) hue-rotate(-5deg)",
        }}
      >
        <Image
          src="/landingpage.png"
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: "center center" }}
        />
      </div>

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
        <p style={{
          fontFamily: "var(--body-font-family)", fontSize: "var(--step-1)",
          fontWeight: 300, fontStyle: "italic", color: "var(--color-text-main)",
          maxWidth: "480px", textAlign: "center", lineHeight: 1.8,
          letterSpacing: "0.03em", padding: "0 var(--space-m)",
          textShadow: "0 1px 10px rgba(245,235,220,0.8)",
        }}>
          Some memories are easier to enter than explain.
        </p>
      </div>
    </div>
  );
}
