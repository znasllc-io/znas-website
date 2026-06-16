"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";

const DESTINATION = "znas@znas.io";

interface RestartModalProps {
  slug: string;
  clientName: string;
  projectTitle: string;
  onClose: () => void;
}

export default function RestartModal({
  slug,
  clientName,
  projectTitle,
  onClose,
}: RestartModalProps) {
  const { lang } = useLanguage();
  const r = translations[lang].proposals.list;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while the modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const canSend = email.trim() && message.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    const subject = `Restart engagement: ${projectTitle} (${clientName})`;
    const bodyLines = [
      `From: ${name || "(no name)"} <${email}>`,
      `Engagement: ${projectTitle}`,
      `Client: ${clientName}`,
      `Ref: ${slug}`,
      "",
      message,
    ];
    const url =
      `mailto:${DESTINATION}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = url;
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "var(--font-mono)",
    fontSize: "0.85rem",
    letterSpacing: "0.02em",
    background: "var(--color-bg-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "9999px",
    padding: "0.6rem 0.75rem",
    color: "var(--color-text-primary)",
    outline: "none",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: "0.6rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
    marginBottom: "0.4rem",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="restart-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "var(--color-bg-void)",
          border: "1px solid var(--color-accent)",
          borderRadius: "9999px",
          padding: "2rem 1.75rem 1.75rem",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={r.restartClose}
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            color: "var(--color-text-tertiary)",
            background: "transparent",
            border: "none",
            cursor: "none",
            padding: "0.4rem 0.6rem",
          }}
        >
          ✕
        </button>

        <h2
          id="restart-modal-title"
          className="text-heading"
          style={{
            fontSize: "1.4rem",
            marginBottom: "0.6rem",
            color: "var(--color-text-primary)",
          }}
        >
          {r.restartTitle}
        </h2>
        <p
          className="text-small"
          style={{
            color: "var(--color-text-tertiary)",
            marginBottom: "1.5rem",
            lineHeight: 1.5,
          }}
        >
          {r.restartSubhead(projectTitle, clientName)}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.9rem" }}>
            <label htmlFor="restart-name" style={labelStyle}>
              {r.restartNameLabel}
            </label>
            <input
              id="restart-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={r.restartNamePlaceholder}
              autoComplete="name"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          <div style={{ marginBottom: "0.9rem" }}>
            <label htmlFor="restart-email" style={labelStyle}>
              {r.restartEmailLabel}
            </label>
            <input
              id="restart-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={r.restartEmailPlaceholder}
              autoComplete="email"
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="restart-message" style={labelStyle}>
              {r.restartMessageLabel}
            </label>
            <textarea
              id="restart-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={r.restartMessagePlaceholder}
              rows={4}
              required
              style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          <button
            type="submit"
            disabled={!canSend}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: canSend ? "var(--color-bg-void)" : "var(--color-text-ghost)",
              backgroundColor: canSend ? "var(--color-accent)" : "transparent",
              border: `1px solid ${canSend ? "var(--color-accent)" : "var(--color-border)"}`,
              borderRadius: "9999px",
              padding: "0.65rem 1.4rem",
              cursor: canSend ? "none" : "default",
              transition: "all 0.3s ease",
              opacity: canSend ? 1 : 0.5,
              width: "100%",
            }}
          >
            {r.restartSend}
          </button>
        </form>

        <p
          style={{
            marginTop: "1.25rem",
            paddingTop: "1.25rem",
            borderTop: "1px dashed var(--color-border)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: "var(--color-text-tertiary)",
            textAlign: "center",
          }}
        >
          {r.restartEmailFallback}{" "}
          <a
            href={`mailto:${DESTINATION}?subject=${encodeURIComponent(
              `Restart engagement: ${projectTitle}`
            )}`}
            style={{
              color: "var(--color-accent)",
              textDecoration: "none",
              cursor: "none",
            }}
          >
            {r.restartEmailLink}
          </a>
        </p>
      </div>
    </div>
  );
}
