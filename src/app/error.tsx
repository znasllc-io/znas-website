"use client";

/**
 * Branded runtime-error boundary — keeps unexpected failures inside the
 * site's look instead of Next's unstyled default, and offers a retry.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        Error
      </p>
      <h1
        className="fde-headline fde-gradient-text"
        style={{ fontSize: "clamp(2rem, 6vw, 3.4rem)", marginTop: "1.1rem" }}
      >
        Something went wrong
      </h1>
      <p style={{ marginTop: "1.4rem", maxWidth: "460px", color: "var(--fde-gray)", lineHeight: 1.7 }}>
        An unexpected error occurred{error.digest ? ` (ref ${error.digest})` : ""}. Please try
        again.
      </p>
      <button type="button" onClick={reset} className="fde-btn-primary" style={{ marginTop: "2.4rem" }}>
        Try again
      </button>
    </div>
  );
}
