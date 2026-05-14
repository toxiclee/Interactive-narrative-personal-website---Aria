export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 animate-fade-in delay-1000">
      <nav
        className="flex items-center justify-center"
        style={{
          padding: "var(--space-m) var(--container-padding)",
          perspective: "900px",
        }}
      >
        <div
          className="relative inline-grid place-items-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span
            aria-hidden
            className="pointer-events-none col-start-1 row-start-1 tracking-[0.25em] uppercase blur-[2.5px]"
            style={{
              fontFamily: "var(--body-font-family)",
              fontSize: "var(--step-1)",
              fontWeight: 300,
              color: "var(--color-soft-soil)",
              opacity: 0.38,
              transform: "translateZ(-16px) scale(1.05)",
            }}
          >
            Aria Space
          </span>
          <a
            href="/"
            className="col-start-1 row-start-1 tracking-[0.25em] uppercase"
            style={{
              color: "var(--color-dark-soil)",
              fontFamily: "var(--body-font-family)",
              fontSize: "var(--step-1)",
              fontWeight: 300,
              transition: "var(--transition-soft)",
              textDecoration: "none",
              textShadow:
                "0 10px 28px rgba(120, 100, 90, 0.12), 0 1px 0 rgba(255, 255, 255, 0.4)",
              transform: "translateZ(6px)",
              zIndex: 1,
            }}
          >
            Aria Space
          </a>
        </div>
      </nav>
    </header>
  );
}
