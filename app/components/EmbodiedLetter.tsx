"use client";

import { useRef, useEffect, useState } from "react";
import { useEmbodiedLetter } from "../letter/hooks/useEmbodiedLetter";

const letterParagraphStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "var(--space-m)",
  marginLeft: "auto",
  marginRight: "auto",
  maxWidth: "36ch",
  textAlign: "center",
  transition: "opacity 0.5s ease, color 0.45s ease",
  color: "var(--color-text-main)",
  opacity: 0.9,
};

export default function EmbodiedLetter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [afterWaveVisible, setAfterWaveVisible] = useState(false);

  const state = useEmbodiedLetter(videoRef);

  useEffect(() => {
    if (state.hasWaved) {
      const timer = setTimeout(() => setAfterWaveVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setAfterWaveVisible(false);
    }
  }, [state.hasWaved]);

  const getTextContainerStyle = (): React.CSSProperties => {
    if (state.hasWaved) {
      return {
        transition: "filter 1s ease, opacity 1.2s ease, transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "filter, opacity, transform",
        opacity: 0,
        filter: "blur(4px)",
        transform: "translateY(12px)",
        pointerEvents: "none",
      };
    }

    return { opacity: 1, transform: "translateY(0)" };
  };

  return (
    <>
      <video
        ref={videoRef}
        style={{ position: "fixed", top: "-9999px", left: "-9999px", width: 320, height: 240, pointerEvents: "none" }}
        playsInline
        muted
      />

      {!state.webcamActive && (
        <div
          style={{
            position: "fixed",
            bottom: "max(var(--space-m), env(safe-area-inset-bottom, 0px))",
            right: "max(var(--space-m), env(safe-area-inset-right, 0px))",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-xs)",
          }}
        >
          <button
            type="button"
            onClick={() => void state.startWebcam()}
            aria-label="Turn on camera to wave at the letter"
            title="Camera on — wave to let words step aside"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "1px solid rgba(120, 100, 80, 0.35)",
              background: "rgba(255, 252, 248, 0.92)",
              color: "var(--color-soft-soil)",
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transition: "transform 0.2s ease, border-color 0.2s ease, background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.borderColor = "var(--color-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.borderColor = "rgba(120, 100, 80, 0.35)";
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </button>
          {!state.fallbackMode && (
            <button
              type="button"
              onClick={state.startFallback}
              style={{
                fontFamily: "var(--body-font-family)",
                fontSize: "0.65rem",
                letterSpacing: "0.08em",
                color: "var(--color-text-soft)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px 4px",
                opacity: 0.65,
              }}
            >
              keyboard
            </button>
          )}
        </div>
      )}

      <section
        style={{
          background: "#fff",
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: 0,
        }}
      >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.06,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
              backgroundRepeat: "repeat",
              backgroundSize: "256px 256px",
            }}
          />

          <div
            className="relative mx-auto w-full"
            style={{
              padding: "var(--space-xl) var(--space-m)",
              maxWidth: "min(42rem, 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "1px",
                background: "var(--color-accent)",
                marginBottom: "var(--space-m)",
                marginLeft: "auto",
                marginRight: "auto",
                opacity: 0.4,
              }}
            />

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
                <span key={i} style={letterParagraphStyle}>
                  {sentence}
                </span>
              ))}
            </div>

            {state.hasWaved && (
              <p
                style={{
                  fontFamily: 'var(--font-caveat), "Caveat", cursive',
                  fontSize: "clamp(1rem, 1.5vw, 1.4rem)",
                  color: "var(--color-text-soft)",
                  textAlign: "center",
                  marginTop: "var(--space-xl)",
                  opacity: afterWaveVisible ? 0.7 : 0,
                  transition: "opacity 2s ease",
                  fontStyle: "italic",
                }}
              >
                some words leave before we are ready.
              </p>
            )}

            {!state.hasWaved && (
              <div
                style={{
                  width: "30px",
                  height: "1px",
                  background: "var(--color-accent)",
                  marginTop: "var(--space-l)",
                  marginLeft: "auto",
                  marginRight: "auto",
                  opacity: 0.4,
                  transition: "opacity 1.2s ease",
                }}
              />
            )}
          </div>

          {state.webcamActive && (
            <div
              style={{
                position: "fixed",
                bottom: "var(--space-m)",
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "var(--body-font-family)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                color: "var(--color-text-soft)",
                opacity: 0.4,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "var(--color-accent)",
                  display: "inline-block",
                  animation: "softPulse 3s ease-in-out infinite",
                }}
              />
              camera on
            </div>
          )}

          {state.fallbackMode && (
            <div
              style={{
                position: "fixed",
                bottom: "var(--space-m)",
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "var(--body-font-family)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                color: "var(--color-text-soft)",
                opacity: 0.35,
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              w to hide · r to show
            </div>
          )}
        </section>
    </>
  );
}
