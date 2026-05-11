"use client";

export default function SceneLetter() {
  return (
    <section
      style={{
        background: "#fff",
        position: "relative",
      }}
    >
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

      <div
        className="relative max-w-xl mx-auto"
        style={{
          padding: "var(--space-xl) var(--space-m)",
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
            fontFamily: '"Caveat", cursive',
            fontSize: "clamp(1.3rem, 2.2vw, 2.2rem)",
            fontWeight: 400,
            color: "var(--color-text-main)",
            lineHeight: 2.0,
            textAlign: "center" as const,
          }}
        >
          <p style={{ marginBottom: "var(--space-m)" }}>
            I&apos;m writing this from a coffee shop in New Haven.
          </p>
          <p style={{ marginBottom: "var(--space-m)" }}>
            The music is louder than the gray afternoon outside, conversations drift across the room, and cups touch the tables like small interruptions of time. Beyond the classroom windows, the trees sway lightly in the wind as if the season is quietly leaving without telling anyone.
          </p>
          <p style={{ marginBottom: "var(--space-m)" }}>
            A classmate I barely knew passed by a moment ago.
            For some reason, I suddenly thought: perhaps we will never see each other again.
          </p>
          <p style={{ marginBottom: "var(--space-m)" }}>
            I think a lot about moments like this — the fragile ways people pass through each other&apos;s lives, leaving behind fragments of memory, atmosphere, and feeling that are often difficult to explain directly. Maybe that is why I&apos;ve always been drawn to photography, moving images, and interactive spaces.
          </p>
          <p style={{ marginBottom: "var(--space-m)" }}>
            I&apos;m interested in building experiences that help people feel closer to one another through interaction, space, and emotion. Not only through information, but through environments that can be wandered through slowly — spaces shaped by memory, sound, movement, and observation.
          </p>
          <p style={{ marginBottom: "var(--space-m)" }}>
            This website is part portfolio, part archive, and part experiment. A place where visual storytelling, technology, and human feeling intersect. A small attempt to explore how digital spaces might become more intimate, poetic, and emotionally alive.
          </p>
        </div>

        <div
          style={{
            width: "30px",
            height: "1px",
            background: "var(--color-accent)",
            marginTop: "var(--space-l)",
            marginLeft: "auto",
            marginRight: "auto",
            opacity: 0.4,
          }}
        />
      </div>
    </section>
  );
}
