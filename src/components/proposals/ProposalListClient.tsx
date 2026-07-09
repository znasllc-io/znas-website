"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Navigation from "@/components/layout/Navigation";
import { navigateWithTransition } from "@/lib/transition-nav";
import RestartModal from "@/components/proposals/RestartModal";
import { useLanguage } from "@/lib/language";
import { translations, type ProposalListStrings } from "@/lib/translations";

interface ProposalEntry {
  slug: string;
  clientName: string;
  projectTitle: string;
  projectTitle_es?: string;
  status: "active" | "formalized" | "completed" | "archived";
  expiresAt?: string;
  completedAt?: string;
  summary?: string;
  summary_es?: string;
  hasAccess: boolean;
}

type LifecycleState = "pending" | "formalized" | "archived" | "completed";

// Three-tier grouping:
//   - active:    pending + formalized (live engagements + open proposals)
//   - archived:  status === "archived" OR an active proposal whose expiresAt
//                has passed (auto-archived). Renders a "Contact us" CTA that
//                opens the restart modal.
//   - completed: status === "completed" — finished deals, no CTA.
type Tier = "active" | "archived" | "completed";

function computeLifecycle(p: ProposalEntry, now: number): LifecycleState {
  if (p.status === "completed") return "completed";
  if (p.status === "archived") return "archived";
  if (p.status === "formalized") return "formalized";
  if (p.expiresAt && new Date(p.expiresAt).getTime() < now) return "archived";
  return "pending";
}

function tierFor(s: LifecycleState): Tier {
  if (s === "pending" || s === "formalized") return "active";
  if (s === "completed") return "completed";
  return "archived";
}

// Live-updating countdown to an ISO date. Re-ticks each second when total
// time remaining is < 1 day, otherwise once per minute (cheaper).
function Countdown({
  target,
  units,
  prefix,
}: {
  target: string;
  units: ProposalListStrings["units"];
  prefix: string;
}) {
  const targetMs = useMemo(() => new Date(target).getTime(), [target]);
  // null until mounted: the page is statically prerendered, so a Date.now()
  // initializer bakes the BUILD time into the server HTML and guarantees a
  // hydration mismatch against the client's clock. Render the numbers only
  // client-side.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const remaining = targetMs - Date.now();
    const tick = remaining < 24 * 3600 * 1000 ? 1000 : 60 * 1000;
    const id = setInterval(() => setNow(Date.now()), tick);
    return () => clearInterval(id);
  }, [targetMs]);

  if (now === null) return null;

  const diff = Math.max(0, targetMs - now);
  const d = Math.floor(diff / (24 * 3600 * 1000));
  const h = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
  const m = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
  const s = Math.floor((diff % (60 * 1000)) / 1000);

  const formatted = d > 0
    ? `${d}${units.d} ${String(h).padStart(2, "0")}${units.h}`
    : `${String(h).padStart(2, "0")}${units.h} ${String(m).padStart(2, "0")}${units.m} ${String(s).padStart(2, "0")}${units.s}`;

  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.06em" }}>
      <span style={{ color: "var(--color-text-tertiary)" }}>{prefix} </span>
      <span style={{ color: "var(--color-accent)" }}>{formatted}</span>
    </span>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--color-text-tertiary)",
        padding: "0.5rem 0",
        borderBottom: "1px dashed var(--color-border)",
        marginBottom: "0.25rem",
      }}
    >
      // {label}
    </div>
  );
}

export default function ProposalListClient({
  proposals,
}: {
  proposals: ProposalEntry[];
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [restartFor, setRestartFor] = useState<ProposalEntry | null>(null);
  // Re-tick once a minute so a proposal flips from pending → expired as
  // soon as its expiresAt passes, even with the page held open.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Navigating away skips the full home preloader; bfcache restores are
    // handled by the home page's own pageshow guards (the old empty
    // `unload` bfcache-disabling hack was deprecated and a no-op on iOS).
    sessionStorage.setItem("znas-page-transition", "1");
  }, []);

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setRateLimitMsg("");
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedSlug || loading || countdown > 0) return;

      setError("");
      setRateLimitMsg("");
      setLoading(true);

      try {
        const res = await fetch("/api/proposals/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: selectedSlug, password }),
        });

        if (res.ok) {
          const data = await res.json();
          sessionStorage.setItem(
            `znas-proposal-${selectedSlug}`,
            JSON.stringify({ proposal: data.proposal })
          );
          navigateWithTransition(`/engagements/${selectedSlug}`);
          return;
        }

        if (res.status === 429) {
          const data = await res.json().catch(() => ({}));
          const retryAfter = (data as { retryAfter?: number }).retryAfter ?? 60;
          startCountdown(retryAfter);
          setRateLimitMsg(t.proposals.list.rateLimitMsg(retryAfter));
          setLoading(false);
          return;
        }

        setError(t.proposals.list.invalidKey);
        setLoading(false);
      } catch {
        setError(t.proposals.list.networkError);
        setLoading(false);
      }
    },
    [selectedSlug, password, loading, countdown, startCountdown, t.proposals.list]
  );

  const handleCancel = () => {
    setSelectedSlug(null);
    setPassword("");
    setError("");
    setRateLimitMsg("");
  };

  // Partition + sort into three tiers.
  const { activeGroup, archivedGroup, completedGroup } = useMemo(() => {
    const withState = proposals.map((p) => ({ p, s: computeLifecycle(p, nowMs) }));
    const active = withState.filter((x) => tierFor(x.s) === "active");
    const archived = withState.filter((x) => tierFor(x.s) === "archived");
    const completed = withState.filter((x) => tierFor(x.s) === "completed");

    active.sort((a, b) => {
      // Pending before formalized; within each, soonest-expiring first
      const order = (s: LifecycleState) => (s === "pending" ? 0 : 1);
      const oa = order(a.s);
      const ob = order(b.s);
      if (oa !== ob) return oa - ob;
      const ea = a.p.expiresAt ? new Date(a.p.expiresAt).getTime() : Infinity;
      const eb = b.p.expiresAt ? new Date(b.p.expiresAt).getTime() : Infinity;
      return ea - eb;
    });

    archived.sort((a, b) => {
      // Most-recently-relevant first (use expiresAt as a proxy for recency)
      const da = a.p.expiresAt ? new Date(a.p.expiresAt).getTime() : 0;
      const db = b.p.expiresAt ? new Date(b.p.expiresAt).getTime() : 0;
      return db - da;
    });

    completed.sort((a, b) => {
      const da = a.p.completedAt ? new Date(a.p.completedAt).getTime() : 0;
      const db = b.p.completedAt ? new Date(b.p.completedAt).getTime() : 0;
      return db - da;
    });

    return { activeGroup: active, archivedGroup: archived, completedGroup: completed };
  }, [proposals, nowMs]);

  const renderCard = (p: ProposalEntry, state: LifecycleState) => {
    const isArchived = state === "archived";
    const isFormalized = state === "formalized";
    const isCompleted = state === "completed";
    const isSelected = selectedSlug === p.slug;
    const isInactive = isArchived || isCompleted;
    // A card opens the password prompt only if it's an active tier entry
    // with gated content. Archived cards open the restart modal instead;
    // completed cards are non-interactive.
    const isInteractive = !isInactive && p.hasAccess;
    const localizedTitle =
      lang === "es" && p.projectTitle_es ? p.projectTitle_es : p.projectTitle;
    const localizedSummary =
      lang === "es" && p.summary_es ? p.summary_es : p.summary;

    // Tier-based ambient glow. The base/hover values are read by the CSS
    // keyframes below — each tier breathes at a slightly different rhythm
    // so the list as a whole feels alive, not synchronized.
    const glowClass = isCompleted
      ? "engagement-card--completed"
      : isArchived
      ? "engagement-card--archived"
      : "engagement-card--active";
    const interactiveClass =
      isInteractive || isArchived ? " engagement-card--interactive" : "";

    return (
      <div key={p.slug}>
        <div
          className={`engagement-card ${glowClass}${interactiveClass}`}
          onClick={
            isInteractive
              ? () => {
                  if (selectedSlug !== p.slug) {
                    setSelectedSlug(p.slug);
                    setPassword("");
                    setError("");
                    setRateLimitMsg("");
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }
                }
              : isArchived
              ? () => setRestartFor(p)
              : undefined
          }
          style={{
            display: "block",
            padding: "1.25rem 1.5rem",
            border: `1px ${isInactive ? "dashed" : "solid"} ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
            borderRadius: 0,
            backgroundColor: isSelected ? "var(--color-bg-elevated)" : "transparent",
            transition: "border-color 0.3s, background-color 0.3s",
            cursor: isInteractive || isArchived ? "none" : "default",
            opacity: isCompleted ? 0.78 : isArchived ? 0.9 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isSelected && (isInteractive || isArchived)) {
              e.currentTarget.style.borderColor = "var(--color-accent)";
              e.currentTarget.style.backgroundColor = "var(--color-bg-elevated)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected && (isInteractive || isArchived)) {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  color: isInactive ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
                  marginBottom: "0.25rem",
                }}
              >
                {p.clientName}
              </div>
              {(isInactive || !isInteractive) && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: "var(--color-text-tertiary)",
                    marginBottom: localizedSummary ? "0.4rem" : 0,
                  }}
                >
                  {localizedTitle}
                </div>
              )}
              {(isInactive || !isInteractive) && localizedSummary && (
                <div
                  className="text-small"
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: "0.78rem",
                    lineHeight: 1.45,
                    marginTop: "0.25rem",
                  }}
                >
                  {localizedSummary}
                </div>
              )}
              {!isSelected && isInteractive && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    color: "var(--color-text-tertiary)",
                    textTransform: "uppercase",
                  }}
                >
                  {isFormalized ? t.proposals.list.viewEngagement : t.proposals.list.viewProposal}
                </div>
              )}
              {isArchived && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRestartFor(p);
                  }}
                  style={{
                    display: "inline-block",
                    marginTop: "0.65rem",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                    background: "transparent",
                    border: "1px solid var(--color-accent)",
                    borderRadius: "9999px",
                    padding: "0.5rem 1rem",
                    cursor: "none",
                  }}
                >
                  {t.proposals.list.contactUs} →
                </button>
              )}
            </div>
            {/* State indicator (right side) */}
            <div style={{ flexShrink: 0, paddingTop: "0.15rem", textAlign: "right" }}>
              {state === "pending" && p.expiresAt && (
                <Countdown
                  target={p.expiresAt}
                  units={t.proposals.list.units}
                  prefix={t.proposals.list.expiresIn}
                />
              )}
              {isFormalized && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                  }}
                >
                  // {t.proposals.list.inProgress}
                </span>
              )}
              {isCompleted && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  // {t.proposals.list.completed}
                </span>
              )}
              {isArchived && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  // {t.proposals.list.archived}
                </span>
              )}
            </div>
          </div>
        </div>

        {selectedSlug === p.slug && (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderLeft: "1px solid var(--color-accent)",
              borderRight: "1px solid var(--color-accent)",
              borderBottom: "1px solid var(--color-accent)",
              backgroundColor: "var(--color-bg-elevated)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
                marginBottom: "0.75rem",
              }}
            >
              {t.proposals.list.enterKey}
            </p>
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                autoComplete="off"
                spellCheck={false}
                disabled={loading}
                style={{
                  width: "100%",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  letterSpacing: "0.06em",
                  background: "var(--color-bg-surface)",
                  border: `1px solid ${error ? "#F87171" : "var(--color-border)"}`,
                  borderRadius: "9999px",
                  padding: "0.65rem 0.75rem",
                  color: "var(--color-text-primary)",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                  boxSizing: "border-box",
                  marginBottom: "0.75rem",
                }}
                onFocus={(e) => {
                  if (!error) e.currentTarget.style.borderColor = "var(--color-accent)";
                }}
                onBlur={(e) => {
                  if (!error) e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              />

              {error && (
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "#F87171",
                  marginBottom: "0.5rem",
                }}>
                  {error}
                </p>
              )}
              {rateLimitMsg && (
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--color-text-tertiary)",
                  marginBottom: "0.5rem",
                }}>
                  {rateLimitMsg}
                  {countdown > 0 && (
                    <span style={{ color: "var(--color-accent)", marginLeft: "0.5rem" }}>
                      {countdown}s
                    </span>
                  )}
                </p>
              )}

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="submit"
                  disabled={loading || countdown > 0 || !password.trim()}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: loading || !password.trim() ? "var(--color-text-ghost)" : "var(--color-bg-void)",
                    backgroundColor: loading || !password.trim() ? "transparent" : "var(--color-accent)",
                    border: `1px solid ${loading || !password.trim() ? "var(--color-border)" : "var(--color-accent)"}`,
                    borderRadius: "9999px",
                    padding: "0.5rem 1.2rem",
                    cursor: loading || !password.trim() ? "default" : "none",
                    transition: "all 0.3s ease",
                    opacity: loading || !password.trim() ? 0.5 : 1,
                  }}
                >
                  {loading ? t.proposals.list.verifying : t.proposals.list.access}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-text-tertiary)",
                    backgroundColor: "transparent",
                    border: "1px solid var(--color-border)",
                    borderRadius: "9999px",
                    padding: "0.5rem 1.2rem",
                    cursor: "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {t.proposals.list.cancel}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Navigation variant="portal" backHref="/portfolio" backLabel={t.nav.back} />

      <div
        style={{
          minHeight: "100svh",
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
          <div className="container" style={{ maxWidth: "600px" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h1 className="text-heading" style={{ marginBottom: "0.75rem" }}>
                {t.proposals.list.title}
              </h1>
              <p className="text-small" style={{ color: "var(--color-text-tertiary)" }}>
                {t.proposals.list.subtitle}
              </p>
            </div>

            {activeGroup.length === 0 &&
              archivedGroup.length === 0 &&
              completedGroup.length === 0 && (
                <p
                  className="text-small"
                  style={{
                    color: "var(--color-text-ghost)",
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  {t.proposals.list.noProposals}
                </p>
              )}

            {activeGroup.length > 0 && (
              <div
                style={{
                  marginBottom:
                    archivedGroup.length + completedGroup.length > 0 ? "2.5rem" : 0,
                }}
              >
                <SectionHeader label={t.proposals.list.activeHeader} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
                  {activeGroup.map(({ p, s }) => renderCard(p, s))}
                </div>
              </div>
            )}

            {archivedGroup.length > 0 && (
              <div style={{ marginBottom: completedGroup.length > 0 ? "2.5rem" : 0 }}>
                <SectionHeader label={t.proposals.list.archivedHeader} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
                  {archivedGroup.map(({ p, s }) => renderCard(p, s))}
                </div>
              </div>
            )}

            {completedGroup.length > 0 && (
              <div>
                <SectionHeader label={t.proposals.list.completedHeader} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
                  {completedGroup.map(({ p, s }) => renderCard(p, s))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {restartFor && (
        <RestartModal
          slug={restartFor.slug}
          clientName={restartFor.clientName}
          projectTitle={
            lang === "es" && restartFor.projectTitle_es
              ? restartFor.projectTitle_es
              : restartFor.projectTitle
          }
          onClose={() => setRestartFor(null)}
        />
      )}
    </>
  );
}
