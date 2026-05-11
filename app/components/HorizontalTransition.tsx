"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Stronger correction for warm/yellow images — push toward clean white
const imageWarmToWhite: React.CSSProperties = {
  filter: "brightness(1.12) saturate(0.6) sepia(0) hue-rotate(-8deg)",
};

// Minimal adjustment for already-white images (2.png)
const imageNeutral: React.CSSProperties = {
  filter: "brightness(1.02) saturate(0.9)",
};

interface HorizontalTransitionProps {
  variant: "letter-to-photo" | "photo-to-projects" | "projects-to-archive" | "archive-to-memory" | "dress-closeup" | "letter-to-photography";
}

/* ═══════════════════════════════════════════════════════════════
   TRANSITION 1: ballet1st.png — with mirror/glass overlay on scroll
   ═══════════════════════════════════════════════════════════════ */
function LetterToPhotoPainting({ progress }: { progress: number }) {
  const mirrorX = 20 + progress * 60;
  const mirrorOpacity = 0.15 + Math.sin(progress * Math.PI) * 0.25;
  const reflectionAngle = 120 + progress * 40;

  return (
    <div className="relative" style={{ width: "200vw", height: "100%", minWidth: "200vw", filter: "brightness(1.25) saturate(0.2) hue-rotate(-30deg)" }}>
      <Image
        src="/ballet1st.png"
        alt=""
        fill
        className="object-cover"
      />

      {/* Mirror glass reflection that moves with scroll */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(${reflectionAngle}deg, 
              transparent ${mirrorX - 15}%, 
              rgba(255,255,255,${mirrorOpacity * 0.6}) ${mirrorX - 5}%, 
              rgba(255,255,255,${mirrorOpacity}) ${mirrorX}%, 
              rgba(255,255,255,${mirrorOpacity * 0.6}) ${mirrorX + 5}%, 
              transparent ${mirrorX + 15}%
            )
          `,
          mixBlendMode: "soft-light",
        }}
      />

      {/* Secondary subtle caustic */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at ${30 + progress * 40}% ${40 + progress * 20}%, 
              rgba(255,255,255,${mirrorOpacity * 0.4}) 0%, transparent 40%),
            radial-gradient(ellipse at ${70 - progress * 30}% ${60 - progress * 15}%, 
              rgba(240,245,255,${mirrorOpacity * 0.3}) 0%, transparent 35%)
          `,
        }}
      />

      {/* Glass edge shimmer line */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(${reflectionAngle + 90}deg,
              transparent ${mirrorX - 1}%,
              rgba(255,255,255,${mirrorOpacity * 1.2}) ${mirrorX}%,
              transparent ${mirrorX + 1}%
            )
          `,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRANSITION 2: Rehearsal Piano & Sheet Music
   The sounds of practice — piano, metronome, choreography notes.
   ═══════════════════════════════════════════════════════════════ */
function PhotoToProjectsPainting() {
  return (
    <svg viewBox="0 0 3600 900" fill="none" className="h-full w-auto max-w-none"
      preserveAspectRatio="xMidYMid slice" style={{ minWidth: "400vw" }}>
      <rect width="3600" height="900" fill="#f3ede5" />

      {/* ─── LEFT: Upright piano ─── */}
      <g opacity="0.55">
        {/* Piano body */}
        <rect x="100" y="150" width="350" height="550" rx="4" fill="#4a3828" opacity="0.7" />
        <rect x="110" y="160" width="330" height="250" rx="2" fill="#3a2818" opacity="0.5" />
        {/* Music stand */}
        <rect x="140" y="180" width="270" height="180" rx="2" fill="#5a4838" opacity="0.4" />
        {/* Sheet music */}
        <rect x="155" y="195" width="115" height="150" fill="#f8f4ec" opacity="0.7" rx="1" />
        <rect x="280" y="195" width="115" height="150" fill="#f5f0e8" opacity="0.65" rx="1" />
        {/* Music notation lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <g key={`staff-${i}`}>
            <line x1="162" y1={210 + i * 8} x2="263" y2={210 + i * 8} stroke="#8a7a68" strokeWidth="0.5" opacity="0.4" />
            <line x1="287" y1={210 + i * 8} x2="388" y2={210 + i * 8} stroke="#8a7a68" strokeWidth="0.5" opacity="0.4" />
          </g>
        ))}
        {/* Note dots */}
        {[175, 195, 220, 240, 255, 300, 320, 345, 365, 380].map((x, i) => (
          <circle key={`note-${i}`} cx={x} cy={212 + (i * 7) % 35} r="2" fill="#4a3828" opacity="0.4" />
        ))}
        {/* Keys */}
        <rect x="115" y="440" width="320" height="80" fill="#f8f4ec" opacity="0.6" rx="1" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => (
          <line key={`key-${i}`} x1={115 + i * 23 + 23} y1="440" x2={115 + i * 23 + 23} y2="520" stroke="#d4c4a8" strokeWidth="0.8" opacity="0.4" />
        ))}
        {/* Black keys */}
        {[0, 1, 3, 4, 5, 7, 8, 10, 11, 12].map(i => (
          <rect key={`bk-${i}`} x={130 + i * 23} y="440" width="14" height="48" fill="#3a2818" opacity="0.5" rx="1" />
        ))}
        {/* Piano legs */}
        <rect x="120" y="700" width="15" height="80" fill="#4a3828" opacity="0.5" />
        <rect x="415" y="700" width="15" height="80" fill="#4a3828" opacity="0.5" />
      </g>

      {/* ─── Metronome ─── */}
      <g opacity="0.4" transform="translate(520, 450)">
        <path d="M-20 200 L20 200 L12 0 L-12 0 Z" fill="#7a6450" opacity="0.6" />
        <line x1="0" y1="180" x2="8" y2="30" stroke="#4a3828" strokeWidth="1.5" />
        <circle cx="8" cy="28" r="5" fill="#b49858" opacity="0.5" />
      </g>

      {/* ─── MIDDLE: Choreography notebook ─── */}
      <g opacity="0.5" transform="translate(800, 250)">
        <rect x="0" y="0" width="350" height="450" fill="#f8f4ec" rx="3" stroke="#c8b8a4" strokeWidth="1.5" />
        {/* Spine */}
        <line x1="5" y1="0" x2="5" y2="450" stroke="#b8a488" strokeWidth="2" opacity="0.4" />
        {/* Dance figure sketches */}
        <g opacity="0.35" transform="translate(80, 60)">
          <circle cx="0" cy="-15" r="8" fill="none" stroke="#7a6450" strokeWidth="1.2" />
          <line x1="0" y1="-7" x2="0" y2="30" stroke="#7a6450" strokeWidth="1.2" />
          <line x1="0" y1="5" x2="-15" y2="-5" stroke="#7a6450" strokeWidth="1" />
          <line x1="0" y1="5" x2="18" y2="0" stroke="#7a6450" strokeWidth="1" />
          <line x1="0" y1="30" x2="-12" y2="55" stroke="#7a6450" strokeWidth="1" />
          <line x1="0" y1="30" x2="10" y2="58" stroke="#7a6450" strokeWidth="1" />
        </g>
        <g opacity="0.3" transform="translate(180, 80)">
          <circle cx="0" cy="-15" r="7" fill="none" stroke="#7a6450" strokeWidth="1" />
          <line x1="0" y1="-8" x2="0" y2="25" stroke="#7a6450" strokeWidth="1" />
          <line x1="0" y1="0" x2="-20" y2="10" stroke="#7a6450" strokeWidth="0.8" />
          <line x1="0" y1="0" x2="15" y2="-12" stroke="#7a6450" strokeWidth="0.8" />
          <line x1="0" y1="25" x2="-8" y2="50" stroke="#7a6450" strokeWidth="0.8" />
          <line x1="0" y1="25" x2="14" y2="48" stroke="#7a6450" strokeWidth="0.8" />
        </g>
        <g opacity="0.25" transform="translate(270, 65)">
          <circle cx="0" cy="-12" r="7" fill="none" stroke="#7a6450" strokeWidth="1" />
          <path d="M0 -5 Q2 10 -3 25 Q-5 35 0 40" stroke="#7a6450" strokeWidth="1" fill="none" />
          <path d="M0 0 Q-18 5 -25 -5" stroke="#7a6450" strokeWidth="0.8" fill="none" />
          <path d="M0 0 Q15 -8 22 2" stroke="#7a6450" strokeWidth="0.8" fill="none" />
        </g>
        {/* Arrows / movement notation */}
        <path d="M60 180 Q100 170 140 185 Q180 200 220 185" stroke="#a09080" strokeWidth="1" fill="none" opacity="0.3" />
        <path d="M80 250 L120 230 L160 250 L200 230 L240 250" stroke="#a09080" strokeWidth="0.8" fill="none" opacity="0.25" />
        {/* Written notes */}
        {[300, 320, 340, 360, 380].map((y, i) => (
          <line key={`ln-${i}`} x1="30" y1={y} x2={200 - i * 20} y2={y} stroke="#b0a090" strokeWidth="0.6" opacity="0.25" />
        ))}
      </g>

      {/* ─── Scattered ribbons on floor ─── */}
      <path d="M1250 720 Q1280 700 1310 715 Q1330 730 1300 745 Q1270 740 1250 720 Z" fill="#d4a8a0" opacity="0.2" />
      <path d="M1320 740 Q1350 755 1380 745 Q1400 730 1420 750" stroke="#d4b8a0" strokeWidth="1.5" fill="none" opacity="0.2" />

      {/* ─── RIGHT: Barre with morning light ─── */}
      <g opacity="0.4">
        <line x1="1600" y1="380" x2="2400" y2="380" stroke="#6e5838" strokeWidth="4" strokeLinecap="round" />
        {[1680, 1880, 2080, 2280].map((x, i) => (
          <line key={`br2-${i}`} x1={x} y1="380" x2={x} y2="540" stroke="#6e5838" strokeWidth="2.5" opacity="0.5" />
        ))}
      </g>

      {/* Light streaming from off-frame window */}
      <ellipse cx="2000" cy="350" rx="300" ry="400" fill="#f8f0e0" opacity="0.12" />

      {/* ─── FAR RIGHT: Dancer silhouette stretching ─── */}
      <g opacity="0.3" transform="translate(2600, 220)">
        <path d="M0 120 C-3 80 -1 40 0 15 C1 5 0 -5 0 -12" stroke="#7a5848" strokeWidth="3.5" fill="none" />
        <ellipse cx="0" cy="-18" rx="11" ry="12" fill="#c8a888" opacity="0.6" />
        <circle cx="0" cy="-27" r="7" fill="#4a3020" opacity="0.4" />
        <path d="M-8 30 C-30 20 -60 30 -85 25" stroke="#b8988" strokeWidth="2.5" fill="none" />
        <path d="M8 25 C25 5 45 -10 65 -25" stroke="#b89880" strokeWidth="2.5" fill="none" />
        <ellipse cx="0" cy="125" rx="38" ry="16" fill="#f0e8dc" opacity="0.5" />
        <path d="M-4 138 L-7 220 L-9 240" stroke="#b89880" strokeWidth="3" fill="none" />
        <path d="M4 138 L6 218 L8 238" stroke="#b89880" strokeWidth="2.8" fill="none" />
      </g>

      {/* ─── Very far right: another window, fading ─── */}
      <g opacity="0.25">
        <rect x="3000" y="120" width="200" height="380" fill="#faf4e8" opacity="0.5" />
        <rect x="3000" y="120" width="200" height="380" fill="none" stroke="#9e8e78" strokeWidth="2.5" />
        <line x1="3100" y1="120" x2="3100" y2="500" stroke="#9e8e78" strokeWidth="1.5" opacity="0.4" />
      </g>

      {/* Rose petals scattered */}
      {[1500, 1700, 2200, 2500, 2800, 3200].map((x, i) => (
        <ellipse key={`petal-${i}`} cx={x} cy={700 + (i * 30) % 100} rx={5 + i % 3} ry={3 + i % 2}
          fill="#c8988e" opacity={0.12 + (i % 3) * 0.04} transform={`rotate(${i * 35} ${x} ${700 + (i * 30) % 100})`} />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRANSITION 3: The Costume Wardrobe
   Rows of tutus, spools of ribbon, a dressmaker's mannequin.
   ═══════════════════════════════════════════════════════════════ */
function ProjectsToArchivePainting() {
  return (
    <svg viewBox="0 0 3600 900" fill="none" className="h-full w-auto max-w-none"
      preserveAspectRatio="xMidYMid slice" style={{ minWidth: "400vw" }}>
      <rect width="3600" height="900" fill="#f0e8de" />

      {/* ─── LEFT: Row of hanging tutus ─── */}
      <line x1="80" y1="100" x2="900" y2="100" stroke="#6e5840" strokeWidth="4" opacity="0.5" />
      {[150, 300, 450, 600, 750].map((x, i) => (
        <g key={`tutu-${i}`} opacity={0.55 - i * 0.04}>
          <line x1={x} y1="100" x2={x} y2="160" stroke="#6e5840" strokeWidth="1.5" />
          {/* Bodice */}
          <path d={`M${x - 12} 160 Q${x} 155 ${x + 12} 160 L${x + 10} 200 Q${x} 205 ${x - 10} 200 Z`}
            fill="#e8dcd0" opacity="0.5" stroke="#c8b8a4" strokeWidth="0.8" />
          {/* Tutu layers */}
          <ellipse cx={x} cy={220} rx={45 - i * 3} ry={18} fill="#f5ede4" opacity="0.7" />
          <ellipse cx={x} cy={216} rx={40 - i * 2} ry={14} fill="#faf6f0" opacity="0.55" />
          <ellipse cx={x} cy={225} rx={48 - i * 3} ry={15} fill="#ede4d8" opacity="0.45" />
          {/* Fabric draping */}
          <path d={`M${x - 45} 220 Q${x - 50} 260 ${x - 40} 300 Q${x - 35} 330 ${x - 42} 360`}
            stroke="#d8ccc0" strokeWidth="1" fill="none" opacity="0.3" />
          <path d={`M${x + 45} 220 Q${x + 50} 255 ${x + 40} 295 Q${x + 35} 325 ${x + 42} 355`}
            stroke="#d8ccc0" strokeWidth="1" fill="none" opacity="0.3" />
        </g>
      ))}

      {/* ─── MIDDLE: Dressmaker's mannequin ─── */}
      <g opacity="0.5" transform="translate(1200, 150)">
        {/* Stand */}
        <line x1="0" y1="450" x2="0" y2="550" stroke="#7a6450" strokeWidth="3" />
        <ellipse cx="0" cy="560" rx="40" ry="8" fill="#7a6450" opacity="0.4" />
        {/* Body form */}
        <path d="M-30 0 Q-35 50 -32 120 Q-28 200 -25 280 Q-20 350 -15 400 L15 400 Q20 350 25 280 Q28 200 32 120 Q35 50 30 0 Z"
          fill="#d4c4b0" opacity="0.5" stroke="#a89888" strokeWidth="1.5" />
        {/* Neck */}
        <rect x="-8" y="-30" width="16" height="35" fill="#c8b8a4" opacity="0.4" rx="4" />
        {/* Partial tutu being sewn */}
        <ellipse cx="0" cy="320" rx="55" ry="22" fill="#f5ede4" opacity="0.6" />
        <ellipse cx="0" cy="316" rx="48" ry="18" fill="#faf6f0" opacity="0.5" />
        {/* Pins */}
        <line x1="20" y1="300" x2="25" y2="290" stroke="#a0a0a0" strokeWidth="0.8" opacity="0.4" />
        <line x1="-15" y1="310" x2="-20" y2="300" stroke="#a0a0a0" strokeWidth="0.8" opacity="0.4" />
        <circle cx="25" cy="289" r="1.5" fill="#c83030" opacity="0.3" />
        <circle cx="-20" cy="299" r="1.5" fill="#c83030" opacity="0.3" />
      </g>

      {/* ─── Sewing table with supplies ─── */}
      <g opacity="0.45" transform="translate(1550, 480)">
        <rect x="0" y="0" width="300" height="12" fill="#8a7458" rx="2" />
        <line x1="20" y1="12" x2="15" y2="180" stroke="#7a6450" strokeWidth="2.5" />
        <line x1="280" y1="12" x2="285" y2="180" stroke="#7a6450" strokeWidth="2.5" />
        {/* Ribbon spools */}
        <circle cx="60" cy="-8" r="15" fill="none" stroke="#d4a8a0" strokeWidth="3" opacity="0.5" />
        <circle cx="60" cy="-8" r="6" fill="#7a6450" opacity="0.3" />
        <circle cx="110" cy="-10" r="12" fill="none" stroke="#a8c0c8" strokeWidth="2.5" opacity="0.4" />
        <circle cx="110" cy="-10" r="5" fill="#7a6450" opacity="0.25" />
        {/* Scissors */}
        <path d="M180 -5 Q190 -15 200 -5 Q210 5 200 10 Q190 5 180 -5 Z" fill="#a0a0a0" opacity="0.3" />
        <line x1="200" y1="2" x2="240" y2="-8" stroke="#808080" strokeWidth="1.5" opacity="0.3" />
        {/* Fabric swatch */}
        <rect x="230" y="-15" width="40" height="30" fill="#c8988e" opacity="0.25" rx="1" />
      </g>

      {/* ─── RIGHT: Shelves of pointe shoes ─── */}
      <g opacity="0.45">
        {[0, 1, 2, 3].map(row => (
          <g key={`shelf-${row}`}>
            <line x1="2100" y1={180 + row * 140} x2="2700" y2={180 + row * 140} stroke="#8a7458" strokeWidth="3" />
            {[0, 1, 2, 3, 4].map(col => (
              <g key={`sp-${row}-${col}`} opacity={0.5 - row * 0.08}>
                <ellipse cx={2160 + col * 115} cy={165 + row * 140} rx="12" ry="7"
                  fill="#f0dcc8" stroke="#c8a888" strokeWidth="0.6" />
                <ellipse cx={2185 + col * 115} cy={163 + row * 140} rx="11" ry="6.5"
                  fill="#ece0d0" stroke="#c8a888" strokeWidth="0.5" />
              </g>
            ))}
          </g>
        ))}
      </g>

      {/* ─── FAR RIGHT: Hanging costumes ─── */}
      {[2900, 3050, 3200, 3350].map((x, i) => (
        <g key={`costume-${i}`} opacity={0.35 + (i % 2) * 0.1}>
          <line x1={x} y1="80" x2={x} y2="130" stroke="#6e5840" strokeWidth="1.5" />
          <path d={`M${x - 20} 130 Q${x} 125 ${x + 20} 130 L${x + 18} 400 Q${x} 410 ${x - 18} 400 Z`}
            fill={i % 2 === 0 ? "#e8dcd0" : "#d4c8bc"} opacity="0.4" stroke="#b8a898" strokeWidth="0.8" />
        </g>
      ))}

      {/* Thread trailing across floor */}
      <path d="M1400 750 Q1600 730 1800 760 Q2000 780 2200 740 Q2400 720 2600 755"
        stroke="#d4a8a0" strokeWidth="1" fill="none" opacity="0.15" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRANSITION 4: Real painting — ballet1.png
   ═══════════════════════════════════════════════════════════════ */
function ArchiveToMemoryPainting() {
  return (
    <div className="relative" style={{ width: "200vw", height: "100%", minWidth: "200vw", filter: "brightness(0.88) saturate(0.75) contrast(1.05)" }}>
      <Image
        src="/4.png"
        alt=""
        fill
        className="object-cover"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRANSITION 5: Dress Close-up — ballet2.png with zoom into fabric
   Starts wide, then slowly zooms into the center of a dress/costume.
   ═══════════════════════════════════════════════════════════════ */
function DressCloseupPainting({ progress }: { progress: number }) {
  const scale = 1 + progress * 1.8;
  const originX = 50 + progress * 5;
  const originY = 45 + progress * 10;

  return (
    <div className="relative w-full h-full" style={imageWarmToWhite}>
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${originX}% ${originY}%`,
          transition: "transform 0.1s linear",
          willChange: "transform",
        }}
      >
        <Image
          src="/1.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRANSITION 6: Letter → Photography — 2.png (wide horizontal)
   ═══════════════════════════════════════════════════════════════ */
function LetterToPhotographyPainting() {
  return (
    <div className="relative" style={{ width: "300vw", height: "100%", minWidth: "300vw", ...imageNeutral }}>
      <Image
        src="/2.png"
        alt=""
        fill
        className="object-cover"
      />
    </div>
  );
}

const paintings: Record<HorizontalTransitionProps["variant"], React.FC<{ progress: number }>> = {
  "letter-to-photo": LetterToPhotoPainting,
  "photo-to-projects": PhotoToProjectsPainting,
  "projects-to-archive": ProjectsToArchivePainting,
  "archive-to-memory": ArchiveToMemoryPainting,
  "dress-closeup": DressCloseupPainting,
  "letter-to-photography": LetterToPhotographyPainting,
};

type TransitionEffect = "zoom-through" | "aperture" | "parallax-depth" | "depth-pull" | "dress-zoom" | "vertical-rise";

const variantEffects: Record<HorizontalTransitionProps["variant"], TransitionEffect> = {
  "letter-to-photo": "zoom-through",
  "photo-to-projects": "aperture",
  "projects-to-archive": "parallax-depth",
  "archive-to-memory": "depth-pull",
  "dress-closeup": "dress-zoom",
  "letter-to-photography": "vertical-rise",
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
  const visibility = enterPhase * (1 - exitPhase);

  let paintingStyle: React.CSSProperties = {};
  let containerStyle: React.CSSProperties = {};

  // 3D tilt that eases in/out — gives depth as the image enters and leaves
  const tiltX = (1 - enterPhase) * 4 - exitPhase * 4;
  const tiltY = (midProgress - 0.5) * 2;
  const shadowSpread = 20 + visibility * 30;
  const shadowOpacity = 0.08 * visibility;

  if (effect === "zoom-through") {
    const zoomScale = 1 + midProgress * 0.3;
    const blur = Math.max(0, (1 - enterPhase) * 5 + exitPhase * 5);
    paintingStyle = {
      transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${zoomScale}) translateX(${-midProgress * 100}%)`,
      filter: blur > 0 ? `blur(${blur}px)` : undefined,
      opacity: visibility,
    };
  } else if (effect === "aperture") {
    const aperture = enterPhase * 100;
    containerStyle = { clipPath: `circle(${aperture}% at 50% 50%)` };
    paintingStyle = {
      transform: `perspective(1200px) rotateX(${tiltX * 0.5}deg) rotateY(${tiltY}deg) translateX(${-midProgress * 150}%)`,
      opacity: 1 - exitPhase,
    };
  } else if (effect === "parallax-depth") {
    const depthScale = 1 + (1 - midProgress) * 0.12;
    const rotateY = (1 - enterPhase) * 3 - exitPhase * 3 + tiltY;
    paintingStyle = {
      transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${rotateY}deg) scale(${depthScale}) translateX(${-midProgress * 100}%)`,
      opacity: visibility,
    };
  } else if (effect === "depth-pull") {
    const pullScale = 0.85 + enterPhase * 0.15;
    const pullY = (1 - enterPhase) * 60 + exitPhase * -60;
    paintingStyle = {
      transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${pullScale}) translateX(${-midProgress * 100}%) translateY(${pullY}px)`,
      opacity: visibility,
    };
  } else if (effect === "dress-zoom") {
    const blur = Math.max(0, (1 - enterPhase) * 6 + exitPhase * 6);
    paintingStyle = {
      transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY * 0.5}deg)`,
      filter: blur > 0 ? `blur(${blur}px)` : undefined,
      opacity: visibility,
    };
  } else if (effect === "vertical-rise") {
    const riseY = (1 - enterPhase) * 120 + exitPhase * -80;
    const riseScale = 0.92 + enterPhase * 0.08;
    paintingStyle = {
      transform: `translateY(${riseY}px) scale(${riseScale}) translateX(${-midProgress * 150}%)`,
      opacity: visibility,
    };
  }

  return (
    <div ref={containerRef} style={{ height: "400vh", position: "relative" }}>
      <div className="sticky top-0 w-full overflow-hidden" style={{ height: "100vh", perspective: "1200px", ...containerStyle }}>
        <div className="absolute inset-0 flex items-center" style={{
          willChange: "transform, opacity, filter",
          transformStyle: "preserve-3d",
          boxShadow: `0 ${shadowSpread}px ${shadowSpread * 2}px rgba(0,0,0,${shadowOpacity})`,
          ...paintingStyle,
        }}>
          <Painting progress={midProgress} />
        </div>

        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            linear-gradient(to right, rgba(245,240,235,${0.5 * visibility}) 0%, transparent 10%, transparent 90%, rgba(245,240,235,${0.5 * visibility}) 100%),
            linear-gradient(to bottom, rgba(245,240,235,${0.4 * visibility}) 0%, transparent 18%, transparent 82%, rgba(245,240,235,${0.4 * visibility}) 100%)
          `,
        }} />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2"
          style={{ width: 50, height: 2, borderRadius: 1, background: "rgba(160,144,128,0.15)", opacity: visibility }}>
          <div style={{
            width: `${midProgress * 100}%`, height: "100%", borderRadius: 1,
            background: "var(--color-soft-soil)", opacity: 0.4,
          }} />
        </div>
      </div>
    </div>
  );
}
