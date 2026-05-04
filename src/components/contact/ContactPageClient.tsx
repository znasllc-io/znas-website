"use client";

import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import CustomCursor from "@/components/layout/CustomCursor";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";

const DESTINATION = "znas@znas.io";

export default function ContactPageClient() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const c = t.contactPage;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const canSend = email.trim() && message.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    // Build mailto URL: subject + body get URL-encoded; body includes the
    // sender's name + email so the reply target is preserved even though
    // mailto: itself can't set a different From address.
    const bodyLines = [
      `From: ${name || "(no name)"} <${email}>`,
      "",
      message,
    ];
    const url =
      `mailto:${DESTINATION}` +
      `?subject=${encodeURIComponent(subject || "Inquiry from znas.io")}` +
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
    borderRadius: "2px",
    padding: "0.7rem 0.85rem",
    color: "var(--color-text-primary)",
    outline: "none",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: "0.65rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
    marginBottom: "0.4rem",
  };

  return (
    <>
      <CustomCursor />
      <Navigation variant="portal" backHref="/" backLabel={t.nav.back} />

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--color-bg-void)",
          display: "flex",
          flexDirection: "column",
          paddingTop: "clamp(5rem, 8vh, 7rem)",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 0",
          }}
        >
          <div className="container" style={{ maxWidth: "560px" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <h1 className="text-heading" style={{ marginBottom: "0.75rem" }}>
                {c.title}
              </h1>
              <p
                className="text-small"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {c.subtitle}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
            >
              <div>
                <label style={labelStyle} htmlFor="contact-name">{c.name}</label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={c.namePlaceholder}
                  autoComplete="name"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="contact-email">{c.email}</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={c.emailPlaceholder}
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="contact-subject">{c.subject}</label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={c.subjectPlaceholder}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="contact-message">{c.message}</label>
                <textarea
                  id="contact-message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={c.messagePlaceholder}
                  rows={6}
                  style={{
                    ...inputStyle,
                    fontFamily: "var(--font-body, var(--font-mono))",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    resize: "vertical",
                  }}
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
                  borderRadius: "2px",
                  padding: "0.7rem 1.4rem",
                  cursor: canSend ? "none" : "default",
                  transition: "all 0.3s ease",
                  alignSelf: "flex-start",
                  opacity: canSend ? 1 : 0.5,
                }}
              >
                {c.send}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
