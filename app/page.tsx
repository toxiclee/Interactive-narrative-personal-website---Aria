"use client";

import Header from "./components/Header";
import NarrativeScroll from "./components/NarrativeScroll";
import HorizontalTransition from "./components/HorizontalTransition";
import PhotographySection from "./components/PhotographySection";
import ArchiveSection from "./components/ArchiveSection";
import MemorySpaceSection from "./components/MemorySpaceSection";
import LetterEntry from "./components/LetterEntry";
import SpatialContinuum from "./components/SpatialContinuum";

export default function Home() {
  return (
    <>
      <Header />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "var(--color-warm-cream)",
          zIndex: -2,
        }}
      />

      <main
        style={{
          position: "relative",
          zIndex: 0,
          isolation: "isolate",
        }}
      >
        <SpatialContinuum />
        <div className="relative z-1">
          <NarrativeScroll />

          <LetterEntry />

          <HorizontalTransition variant="letter-to-photography" />

          <PhotographySection />

          <HorizontalTransition variant="dress-closeup" />

          <ArchiveSection />

          <HorizontalTransition variant="archive-to-memory" />

          <MemorySpaceSection />

          <section
            id="contact"
            style={{
              minHeight: "36vh",
              padding: "var(--space-xl) var(--container-padding)",
              background: "var(--color-warm-cream)",
              borderTop: "1px solid rgba(141, 130, 119, 0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--body-font-family)",
                fontSize: "var(--step--1)",
                color: "var(--color-soft-soil)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "var(--space-s)",
              }}
            >
              Contact
            </p>
            <p
              style={{
                fontFamily: "var(--body-font-family)",
                fontSize: "var(--step-0)",
                fontWeight: 300,
                color: "var(--color-text-main)",
                maxWidth: "28rem",
                lineHeight: 1.65,
                marginBottom: "var(--space-m)",
              }}
            >
              If something here spoke to you, I would be glad to hear it.
            </p>
            <a
              href="mailto:hello@example.com"
              style={{
                fontFamily: "var(--body-font-family)",
                fontSize: "var(--step--1)",
                color: "var(--color-text-soft)",
                letterSpacing: "0.08em",
                textDecoration: "none",
                borderBottom: "1px solid rgba(141, 130, 119, 0.25)",
                paddingBottom: 2,
              }}
            >
              hello@example.com
            </a>
          </section>
        </div>
      </main>
    </>
  );
}
