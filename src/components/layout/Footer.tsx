"use client";

import { memo } from "react";

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        padding: "2rem 0",
        backgroundColor: "var(--color-bg-primary)",
      }}
    >
      <div className="container flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <img
            src="/logo.png"
            alt=""
            className="logo-img"
            style={{
              height: "48px",
              width: "auto",
              opacity: 0.9,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-text-tertiary)",
            }}
          >
            ZNAS LLC
          </span>
        </div>
        <span
          className="text-micro"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-tertiary)",
          }}
        >
          © 2026
        </span>
      </div>
    </footer>
  );
}

export default memo(Footer);
