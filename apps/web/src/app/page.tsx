/**
 * AssetFlow – Minimal shell page.
 *
 * This page is a scaffold placeholder. No business features are implemented here.
 * Feature pages are added inside src/features/ as each module is built.
 */
export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "var(--font-body)",
        background: "var(--color-bg)",
      }}
    >
      {/* Status badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.4rem 1rem",
          borderRadius: "9999px",
          border: "1px solid rgba(124,58,237,0.35)",
          background: "rgba(124,58,237,0.1)",
          color: "#a78bfa",
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "2rem",
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
        Scaffold – No features implemented yet
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2.4rem, 6vw, 4rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #fff 0%, #a78bfa 55%, #06b6d4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          marginBottom: "1.25rem",
          lineHeight: 1.1,
        }}
      >
        AssetFlow
      </h1>

      <p
        style={{
          color: "var(--color-text-secondary)",
          fontSize: "1.125rem",
          maxWidth: "520px",
          textAlign: "center",
          lineHeight: 1.65,
          marginBottom: "3rem",
        }}
      >
        Enterprise Asset &amp; Resource Management System. Multi-tenant platform
        for physical assets, resource bookings, maintenance workflows, and audit cycles.
      </p>

      {/* Modules grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          width: "100%",
          maxWidth: "780px",
          marginBottom: "3rem",
        }}
      >
        {[
          "Identity & Access",
          "Organization",
          "Asset Registry",
          "Allocation & Transfer",
          "Resource Booking",
          "Maintenance",
          "Audit",
          "Notifications",
          "Reporting",
          "Activity Log",
        ].map((name) => (
          <div
            key={name}
            style={{
              background: "rgba(13,20,38,0.6)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "var(--radius)",
              padding: "1rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(124,58,237,0.5)",
                flexShrink: 0,
              }}
            />
            {name}
          </div>
        ))}
      </div>

      <footer style={{ color: "var(--color-text-secondary)", fontSize: "0.78rem", opacity: 0.6 }}>
        AssetFlow monorepo scaffold – infrastructure only, no business logic.
      </footer>
    </main>
  );
}
