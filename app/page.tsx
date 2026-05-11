"use client";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import NarrativeScroll from "./components/NarrativeScroll";
import HorizontalTransition from "./components/HorizontalTransition";
import PhotographySection from "./components/PhotographySection";
import ProjectsSection from "./components/ProjectsSection";
import ArchiveSection from "./components/ArchiveSection";
import MemorySpaceSection from "./components/MemorySpaceSection";
import LetterEntry from "./components/LetterEntry";

export default function Home() {
  const [pageProgress, setPageProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setPageProgress(docHeight > 0 ? scrollY / docHeight : 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bgHue = 0;
  const bgSat = 0;
  const bgLight = 100;

  return (
    <>
      <Header />

      {/* Continuous evolving background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `hsl(${bgHue}, ${bgSat}%, ${bgLight}%)`,
          zIndex: -2,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "transparent",
          zIndex: -1,
        }}
      />

      <main style={{ position: "relative", zIndex: 0 }}>
        {/* Part 1: Landing — cinematic push-in */}
        <NarrativeScroll />

        {/* Letter entry — click to expand */}
        <LetterEntry />

        {/* Transition: Letter → Photography (2.png horizontal) */}
        <HorizontalTransition variant="letter-to-photography" />

        {/* Photography section (vertical) */}
        <PhotographySection />

        {/* Transition: Photography → Projects (dress close-up zoom) */}
        <HorizontalTransition variant="dress-closeup" />

        {/* Projects section (vertical) */}
        <ProjectsSection />

        {/* Transition: Projects → Archive (ballet1st.png) */}
        <HorizontalTransition variant="letter-to-photo" />

        {/* Archive section (vertical) */}
        <ArchiveSection />

        {/* Transition: Archive → Memory Space (horizontal painting) */}
        <HorizontalTransition variant="archive-to-memory" />

        {/* Memory Space CTA (vertical) */}
        <MemorySpaceSection />
      </main>
    </>
  );
}
