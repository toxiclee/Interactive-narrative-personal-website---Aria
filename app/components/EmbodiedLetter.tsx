"use client";

import { useRef, useEffect, useState } from "react";
import { useEmbodiedLetter } from "../letter/hooks/useEmbodiedLetter";

export default function EmbodiedLetter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadeInReady, setFadeInReady] = useState(false);
  const [afterWaveVisible, setAfterWaveVisible] = useState(false);

  const state = useEmbodiedLetter(videoRef);

  // Fade in letter text when entering active phase
  useEffect(() => {
    if (state.phase === "active") {
      const timer = setTimeout(() => setFadeInReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // Show the quiet line after wave
  useEffect(() => {
    if (state.hasWaved) {
      const timer = setTimeout(() => setAfterWaveVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setAfterWaveVisible(false);
    }
  }, [state.hasWaved]);

  const getTextContainerStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      transition: "filter 1s ease, opacity 1.2s ease, transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
      willChange: "filter, opacity, transform",
    };

    if (state.hasWaved) {
      return { ...base, opacity: 0, filter: "blur(4px)", transform: "translateX(60px)", pointerEvents: "none" };
    }

    return { ...base, opacity: fadeInReady ? 1 : 0, transform: fadeInReady ? "translateX(0)" : "translateX(-30px)" };
  };

  const getSentenceStyle = (index: number): React.CSSProperties => {
    const isCurrent = state.isNarrating && state.currentSentenceIndex === index;
    const isPast = state.currentSentenceIndex > index && state.currentSentenceIndex >= 0;

    return {
      display: "block",
      marginBottom: "var(--space-m)",
      transition: "text-shadow 0.5s ease, opacity 0.5s ease, color 0.5s ease",
      textShadow: isCurrent ? "0 0 20px rgba(184, 168, 152, 0.4), 0 0 40px rgba(184, 168, 152, 0.15)" : "none",
      color: isCurrent ? "var(--color-text-main)" : isPast ? "var(--color-soft-soil)" : "var(--color-text-main)",
      opacity: isCurrent ? 1 : isPast ? 0.6 : 0.85,
    };
  };

  const isActive = state.phase === "active";

  return (
    <>
      {/* Video element always mounted for webcam stream */}
      <video
        ref={videoRef}
        style={{ position: "fixed", top: "-9999px", left: "-9999px", width: 320, height: 240, pointerEvents: "none" }}
        playsInline
        muted
      />

      {/* Prompt phase */}
      {!isActive && (
        <section style={{ background: "#fff", position: "relative", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: "480px", padding: "var(--space-l)" }}>
            <div style={{
              width: "30px", height: "1px", background: "var(--color-accent)",
              margin: "0 auto var(--space-l)", opacity: 0.4,
            }} />

            <p style={{
              fontFamily: 'var(--font-caveat), "Caveat", cursive',
              fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
              color: "var(--color-text-main)",
              lineHeight: 1.8,
              marginBottom: "var(--space-l)",
            }}>
              This letter can be read by your body.
              <br />
              <span style={{ color: "var(--color-text-soft)", fontSize: "0.85em" }}>
                Your camera stays on your device.
              </span>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-s)", alignItems: "center" }}>
              <button
                onClick={state.startWebcam}
                style={{
                  fontFamily: "var(--body-font-family)",
                  fontSize: "var(--step--1)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                  color: "var(--color-text-main)",
                  background: "transparent",
                  border: "1px solid var(--color-accent)",
                  borderRadius: "var(--radius-card)",
                  padding: "var(--space-s) var(--space-l)",
                  cursor: "pointer",
                  transition: "var(--transition-slow)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-pale-almond)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                Begin with camera
              </button>

              <button
                onClick={state.startFallback}
                style={{
                  fontFamily: "var(--body-font-family)",
                  fontSize: "var(--step--1)",
                  letterSpacing: "0.1em",
                  color: "var(--color-text-soft)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "var(--transition-soft)",
                  padding: "var(--space-xs)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-main)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-soft)"; }}
              >
                or read with keyboard
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Active phase */}
      {isActive && (
        <section style={{ background: "#fff", position: "relative" }}>
          {/* Grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.06,
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
              backgroundRepeat: "repeat",
              backgroundSize: "256px 256px",
            }}
          />

          <div className="relative max-w-xl mx-auto" style={{ padding: "var(--space-xl) var(--space-m)" }}>
            <div style={{
              width: "30px", height: "1px", background: "var(--color-accent)",
              marginBottom: "var(--space-m)", marginLeft: "auto", marginRight: "auto", opacity: 0.4,
            }} />

            {/* Letter text */}
            <div
              style={{
                fontFamily: 'var(--font-caveat), "Caveat", cursive',
                fontSize: "clamp(1.3rem, 2.2vw, 2.2rem)",
                fontWeight: 400,
                color: "var(--color-text-main)",
                lineHeight: 2.0,
                textAlign: "center" as const,
                ...getTextContainerStyle(),
              }}
            >
              {state.sentences.map((sentence, i) => (
                <span key={i} style={getSentenceStyle(i)}>
                  {sentence}
                </span>
              ))}
            </div>

            {/* After-wave quiet line */}
            {state.hasWaved && (
              <p style={{
                fontFamily: 'var(--font-caveat), "Caveat", cursive',
                fontSize: "clamp(1rem, 1.5vw, 1.4rem)",
                color: "var(--color-text-soft)",
                textAlign: "center",
                marginTop: "var(--space-xl)",
                opacity: afterWaveVisible ? 0.7 : 0,
                transition: "opacity 2s ease",
                fontStyle: "italic",
              }}>
                some words leave before we are ready.
              </p>
            )}

            {/* Bottom decorative line */}
            {!state.hasWaved && (
              <div style={{
                width: "30px", height: "1px", background: "var(--color-accent)",
                marginTop: "var(--space-l)", marginLeft: "auto", marginRight: "auto",
                opacity: 0.4, transition: "opacity 1.2s ease",
              }} />
            )}
          </div>

          {/* Status indicators */}
          {state.webcamActive && (
            <div style={{
              position: "fixed", bottom: "var(--space-m)", left: "50%", transform: "translateX(-50%)",
              fontFamily: "var(--body-font-family)", fontSize: "0.7rem", letterSpacing: "0.15em",
              textTransform: "uppercase" as const, color: "var(--color-text-soft)", opacity: 0.4,
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <span style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: state.modelsReady ? "var(--color-accent)" : "var(--color-soft-soil)",
                display: "inline-block",
                animation: state.modelsReady ? "softPulse 3s ease-in-out infinite" : "none",
              }} />
              {state.modelsReady ? "listening" : "loading models…"}
            </div>
          )}

          {state.fallbackMode && (
            <div style={{
              position: "fixed", bottom: "var(--space-m)", left: "50%", transform: "translateX(-50%)",
              fontFamily: "var(--body-font-family)", fontSize: "0.65rem", letterSpacing: "0.1em",
              color: "var(--color-text-soft)", opacity: 0.35, textAlign: "center", lineHeight: 1.6,
            }}>
              space to read · w to erase · r to restore
            </div>
          )}
        </section>
      )}
    </>
  );
}
