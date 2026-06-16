"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

/** Line-art envelope, matching the design doc's outlined icon. */
function MailIcon() {
  return (
    <svg width="30" height="22" viewBox="0 0 30 22" fill="none" aria-hidden>
      <rect x="1" y="1" width="28" height="20" stroke="currentColor" strokeWidth="1.6" />
      <path d="M1.5 1.5L15 12L28.5 1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** Outlined LinkedIn mark. */
function LinkedInIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <rect x="1" y="1" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <text
        x="13"
        y="19"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="'General Sans', sans-serif"
        fontWeight="700"
        fontSize="13"
      >
        in
      </text>
    </svg>
  );
}

/**
 * Contact section: headline left, "Book a Scoping Call" form right.
 * No backend yet — the form opens a prefilled email to znas@znas.io.
 */
export default function ScopingCall() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].scoping;
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(t.mailSubject(name, company));
    const body = encodeURIComponent(t.mailBody(name, company, message));
    window.location.href = `mailto:znas@znas.io?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="fde-container" style={{ paddingTop: "6.5rem", paddingBottom: "6rem" }}>
      <div className="grid md:grid-cols-2 items-start" style={{ gap: "3.5rem" }}>
        <Reveal>
          <h2 className="fde-headline" style={{ fontSize: "clamp(1.8rem, 4vw, 2.9rem)" }}>
            {t.h2a}
            <br />
            {t.h2b}
            <br />
            {t.h2c}
            <span className="fde-gradient-text">{t.h2d}</span>
          </h2>
          <p
            style={{
              marginTop: "1.4rem",
              maxWidth: "400px",
              fontSize: "0.95rem",
              lineHeight: 1.65,
              color: "var(--fde-gray)",
            }}
          >
            {t.sub}
          </p>

          <div
            style={{ marginTop: "2.4rem", display: "flex", flexDirection: "column", gap: "1.3rem" }}
          >
            <a href="mailto:znas@znas.io" className="fde-contact-link">
              <MailIcon />
              znas@znas.io
            </a>
            <a
              href="https://www.linkedin.com/in/znas-io/"
              target="_blank"
              rel="noopener noreferrer"
              className="fde-contact-link"
            >
              <LinkedInIcon />
              znas.io
            </a>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <form
            onSubmit={handleSubmit}
            className="fde-panel"
            style={{ borderRadius: "18px", padding: "2rem 1.9rem" }}
          >
            <p
              style={{
                fontFamily: '"General Sans", sans-serif',
                fontWeight: 600,
                fontSize: "0.95rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--fde-white)",
              }}
            >
              {t.formTitle}
            </p>

            <label
              className="fde-label"
              style={{
                display: "block",
                fontSize: "0.58rem",
                letterSpacing: "0.18em",
                color: "var(--fde-gray-dim)",
                marginTop: "1.6rem",
              }}
            >
              {t.nameLabel}
            </label>
            <input
              className="fde-input"
              style={{ marginTop: "0.5rem" }}
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label
              className="fde-label"
              style={{
                display: "block",
                fontSize: "0.58rem",
                letterSpacing: "0.18em",
                color: "var(--fde-gray-dim)",
                marginTop: "1.2rem",
              }}
            >
              {t.companyLabel}
            </label>
            <input
              className="fde-input"
              style={{ marginTop: "0.5rem" }}
              placeholder={t.companyPlaceholder}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <label
              className="fde-label"
              style={{
                display: "block",
                fontSize: "0.58rem",
                letterSpacing: "0.18em",
                color: "var(--fde-gray-dim)",
                marginTop: "1.2rem",
              }}
            >
              {t.blockingLabel}
            </label>
            <textarea
              className="fde-textarea"
              style={{ marginTop: "0.5rem", minHeight: "115px", resize: "vertical" }}
              placeholder={t.blockingPlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <button
              type="submit"
              className="fde-btn-solid"
              style={{ width: "100%", marginTop: "1.7rem" }}
            >
              {t.submit}
            </button>

            <p
              className="text-center"
              style={{ marginTop: "1rem", fontSize: "0.68rem", color: "var(--fde-gray-dim)" }}
            >
              {t.note}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
