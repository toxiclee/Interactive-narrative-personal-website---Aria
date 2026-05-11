"use client";

import Image from "next/image";

export default function SceneOpening({ progress }: { progress: number }) {
  const overallOpacity = progress < 0.3 ? 1 : 1 - (progress - 0.3) / 0.2;

  // First zoom layer — starts wide (1.0×), pushes in to 1.5×
  const scale = 1 + progress * 0.5;
  // Pan toward the center-right dancers
  const panY = progress * 12;
  const panX = progress * 6;

  return (
    <div className="absolute inset-0" style={{ opacity: Math.max(0, overallOpacity), willChange: "opacity" }}>

      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${50 + panX}% ${45 + panY}%`,
          transition: "transform 0.08s linear",
          willChange: "transform",
          filter: "brightness(1.0) saturate(0.7) hue-rotate(-5deg)",
        }}
      >
        <Image
          src="/landingpage.png"
          alt="Ballet rehearsal studio"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "center center" }}
        />
      </div>

      {/* Scroll prompt — small, centered in the scene */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: progress < 0.03 ? 1 : Math.max(0, 1 - (progress - 0.03) / 0.1),
          transition: "opacity 0.08s linear",
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
    </div>
  );
}
