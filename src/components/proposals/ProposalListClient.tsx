"use client";

import Link from "next/link";

interface ProposalEntry {
  slug: string;
  clientName: string;
  projectTitle: string;
}

export default function ProposalListClient({
  proposals,
}: {
  proposals: ProposalEntry[];
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-void)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          padding: "1.5rem 0",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="container flex items-center justify-between">
          <a
            href="/"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <img
              src="/logo.png"
              alt="ZNAS"
              className="logo-img"
              style={{ height: "32px", width: "auto" }}
            />
          </a>
          <span
            className="text-micro"
            style={{ color: "var(--color-text-ghost)" }}
          >
            Client Portal
          </span>
        </div>
      </nav>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "600px" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h1
              className="text-heading"
              style={{ marginBottom: "0.75rem" }}
            >
              Proposals
            </h1>
            <p
              className="text-small"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Select your organization to access your proposal.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {proposals.map((p) => (
              <Link
                key={p.slug}
                href={`/proposals/${p.slug}`}
                style={{
                  display: "block",
                  padding: "1.25rem 1.5rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: 0,
                  backgroundColor: "transparent",
                  textDecoration: "none",
                  transition:
                    "border-color 0.3s, background-color 0.3s",
                  cursor: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--color-accent)";
                  e.currentTarget.style.backgroundColor =
                    "var(--color-bg-elevated)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--color-border)";
                  e.currentTarget.style.backgroundColor =
                    "transparent";
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {p.clientName}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    color: "var(--color-text-tertiary)",
                    textTransform: "uppercase",
                  }}
                >
                  View Proposal →
                </div>
              </Link>
            ))}

            {proposals.length === 0 && (
              <p
                className="text-small"
                style={{
                  color: "var(--color-text-ghost)",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                No active proposals at this time.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "1.5rem 0",
        }}
      >
        <div className="container flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-text-ghost)",
            }}
          >
            ZNAS LLC
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--color-text-ghost)",
            }}
          >
            © 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
