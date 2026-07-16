"use client";

import { useState, useCallback, useEffect } from "react";
import type { SafeProposal } from "@/lib/proposals";
import Navigation from "@/components/layout/Navigation";
import SiteFooter from "@/components/layout/SiteFooter";
import PasswordGate, { type ProposalAccess } from "./PasswordGate";
import ProposalViewer from "./ProposalViewer";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";

interface ProposalPageClientProps {
  slug: string;
  clientName: string;
}

// Module-scoped handoff cache. The /engagements list verifies the access
// code, stores the verified proposal in sessionStorage, then navigates here
// client-side. Reading straight from sessionStorage inside an effect is
// fragile: React StrictMode (dev) and the page-transition sweep mount this
// component twice, and the throwaway mount would read-and-remove the handoff
// (and its cleanup would null the state) before the surviving mount ran —
// leaving the user staring at the gate for a proposal they *just* unlocked.
// Seeding a module-scoped cache once, from a lazy state initializer, makes the
// read idempotent across those remounts (the cache outlives the instances).
interface Handoff {
  proposal: SafeProposal;
  access?: ProposalAccess;
}

const handoffCache = new Map<string, Handoff>();

function takeHandoff(slug: string): Handoff | null {
  if (typeof window === "undefined") return null;
  const cached = handoffCache.get(slug);
  if (cached) return cached;
  try {
    const stored = sessionStorage.getItem(`znas-proposal-${slug}`);
    if (stored) {
      const { proposal, access } = JSON.parse(stored) as {
        proposal?: SafeProposal;
        access?: ProposalAccess;
      };
      if (proposal) {
        const handoff: Handoff = { proposal, access };
        handoffCache.set(slug, handoff);
        // Consume from storage so a later hard refresh re-gates; the cache
        // (this session only) keeps the surviving mount populated.
        sessionStorage.removeItem(`znas-proposal-${slug}`);
        return handoff;
      }
    }
  } catch { /* ignore parse errors */ }
  return null;
}

// A transient unmount during the arrival transition must not drop the session
// cookie that was just minted. On unmount we *schedule* the logout; a remount
// that fires within the window cancels it. A real navigation away leaves no
// remount to cancel it, so the logout still fires.
let pendingLogout: ReturnType<typeof setTimeout> | null = null;

export default function ProposalPageClient({
  slug,
  clientName,
}: ProposalPageClientProps) {
  const { lang } = useLanguage();
  const t = translations[lang];
  // Pick up proposal data handed off from the /engagements list page. The
  // server already issued an HttpOnly session cookie during that verify call,
  // so auth state lives in the cookie — the access code is never stored or
  // re-sent by client code. Read in a lazy initializer (not an effect) so the
  // viewer renders on the first paint with no gate flash.
  const [handoff, setHandoff] = useState<Handoff | null>(() => takeHandoff(slug));
  const proposal = handoff?.proposal ?? null;
  const access = handoff?.access;

  // Mark that we're on a proposal page so navigation away (including
  // browser back) skips the full home preloader. Home's pageshow guards
  // handle bfcache restores directly — the old empty `unload` listener
  // (a Chromium-only bfcache-disabling hack, deprecated and a no-op on
  // iOS Safari) is gone.
  useEffect(() => {
    sessionStorage.setItem("znas-page-transition", "1");
  }, []);

  const handleSuccess = useCallback(
    (data: SafeProposal, access?: ProposalAccess) => {
      setTimeout(() => setHandoff({ proposal: data, access }), 600);
    },
    []
  );

  // attachmentId is optional — when present the server returns the matching
  // proposal.attachments[] entry; when absent it returns the main PDF.
  // Filename for the saved file comes from the server's Content-Disposition
  // header so it stays correct per-proposal (a previous hardcoded filename
  // would have saved every proposal's PDF under the wrong name).
  const handleDownload = useCallback(
    async (attachmentId?: string) => {
      try {
        const res = await fetch("/api/proposals/download", {
          method: "POST",
          // credentials: "same-origin" is default; explicit here to signal
          // that the HttpOnly session cookie is the auth mechanism.
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, lang, attachmentId }),
        });

        if (!res.ok) {
          alert(t.proposals.viewer.download.errorRefresh);
          return;
        }

        // Pull filename from Content-Disposition. Server-side it's set to
        // the actual on-disk PDF name (e.g. "haven-en.pdf",
        // "haven-gameplan.pdf"). Falls back to a generic name if missing.
        const cd = res.headers.get("Content-Disposition") || "";
        const m = cd.match(/filename="?([^";]+)"?/);
        const filename = m ? m[1] : "proposal.pdf";

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        alert(t.proposals.viewer.download.errorFailed);
      }
    },
    [slug, lang, t.proposals.viewer.download.errorRefresh, t.proposals.viewer.download.errorFailed]
  );

  // Download an Assets-section deliverable (PDF, portal HTML, media) via the
  // gated asset endpoint. Saved filename comes from Content-Disposition.
  const handleDownloadAsset = useCallback(
    async (assetId: string) => {
      try {
        const res = await fetch("/api/proposals/asset", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, assetId }),
        });

        if (!res.ok) {
          alert(t.proposals.viewer.download.errorRefresh);
          return;
        }

        const cd = res.headers.get("Content-Disposition") || "";
        const m = cd.match(/filename="?([^";]+)"?/);
        const filename = m ? m[1] : "download";

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        alert(t.proposals.viewer.download.errorFailed);
      }
    },
    [slug, t.proposals.viewer.download.errorRefresh, t.proposals.viewer.download.errorFailed]
  );

  // On real navigation away, ask the server to drop the session cookie so the
  // gated content can't be reopened without re-entering the code. Best-effort
  // (the cookie also expires on its own Max-Age). Debounced through
  // `pendingLogout`: a mount cancels any logout a transient unmount just
  // scheduled, so the arrival transition's throwaway unmount doesn't nuke the
  // freshly-minted cookie — only an unmount with no immediate remount fires it.
  useEffect(() => {
    if (pendingLogout) {
      clearTimeout(pendingLogout);
      pendingLogout = null;
    }
    return () => {
      pendingLogout = setTimeout(() => {
        pendingLogout = null;
        handoffCache.delete(slug);
        fetch("/api/proposals/logout", {
          method: "POST",
          credentials: "same-origin",
          keepalive: true,
        }).catch(() => { /* tab closing, nothing to do */ });
      }, 200);
    };
  }, [slug]);

  return (
    <>

      {!proposal ? (
        <PasswordGate
          slug={slug}
          clientName={clientName}
          onSuccess={handleSuccess}
        />
      ) : (
        <>
          <Navigation
            // Nav links are derived from which sections actually exist on
            // this proposal. Summary is always present. The rest match the
            // canonical render order in ProposalViewer (roadmap or
            // howItWorks, then timeline, investment, team, initiative).
            // Other proposals' nav stays unaffected.
            navOverride={[
              { label: t.proposals.viewer.nav.summary, href: "#summary" },
              ...(proposal.videoFilename
                ? [{ label: t.proposals.viewer.nav.video, href: "#video" }]
                : []),
              ...(proposal.sections.roadmap
                ? [{ label: t.proposals.viewer.nav.roadmap, href: "#roadmap" }]
                : []),
              ...(proposal.sections.howItWorks
                ? [{ label: t.proposals.viewer.nav.howItWorks, href: "#howItWorks" }]
                : []),
              ...(proposal.sections.timeline
                ? [{ label: t.proposals.viewer.nav.timeline, href: "#timeline" }]
                : []),
              ...(proposal.sections.investment
                ? [{ label: t.proposals.viewer.nav.investment, href: "#investment" }]
                : []),
              ...(proposal.sections.team
                ? [{ label: t.proposals.viewer.nav.team, href: "#team" }]
                : []),
              ...(proposal.sections.initiative
                ? [{ label: t.proposals.viewer.nav.initiative, href: "#initiative" }]
                : []),
              ...(proposal.sections.realEstateAgent
                ? [{ label: t.proposals.viewer.nav.realEstateAgent, href: "#realEstateAgent" }]
                : []),
              ...(proposal.assets && proposal.assets.length > 0
                ? [{ label: t.proposals.viewer.nav.assets, href: "#assets" }]
                : []),
            ]}
            backHref="/engagements"
            backLabel={t.nav.back}
          />
          <ProposalViewer
            proposal={proposal}
            access={access}
            onDownload={handleDownload}
            onDownloadAsset={handleDownloadAsset}
          />
          <SiteFooter />
        </>
      )}
    </>
  );
}
