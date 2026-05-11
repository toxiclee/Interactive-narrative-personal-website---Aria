export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 animate-fade-in delay-1000">
      <nav
        className="flex items-center justify-center"
        style={{
          padding: "var(--space-m) var(--container-padding)",
        }}
      >
        <a
          href="/"
          className="tracking-[0.25em] uppercase"
          style={{
            color: "var(--color-dark-soil)",
            fontFamily: "var(--body-font-family)",
            fontSize: "var(--step-1)",
            fontWeight: 300,
            transition: "var(--transition-soft)",
            textDecoration: "none",
          }}
        >
          Aria Space
        </a>
      </nav>
    </header>
  );
}
