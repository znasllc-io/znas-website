import Link from "next/link";

/**
 * Branded 404 — before this existed, unknown URLs dropped visitors into
 * Next's unstyled default page, a jarring break from the site's look.
 */
export default function NotFound() {
  return (
    <div
      className="fde"
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem 1.5rem",
      }}
    >
      <p className="fde-label" style={{ color: "var(--fde-blue)", letterSpacing: "0.4em" }}>
        404
      </p>
      <h1
        className="fde-headline fde-gradient-text"
        style={{ fontSize: "clamp(2rem, 6vw, 3.4rem)", marginTop: "1.1rem" }}
      >
        Page not found
      </h1>
      <p style={{ marginTop: "1.4rem", maxWidth: "460px", color: "var(--fde-gray)", lineHeight: 1.7 }}>
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link href="/" className="fde-btn-primary" style={{ marginTop: "2.4rem" }}>
        Back to home
      </Link>
    </div>
  );
}
