"use client";

import { useState, useCallback, useEffect } from "react";
import type { SafeProposal } from "@/lib/proposals";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import PasswordGate from "./PasswordGate";
import ProposalViewer from "./ProposalViewer";
import CustomCursor from "@/components/layout/CustomCursor";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";

interface ProposalPageClientProps {
  slug: string;
  clientName: string;
}

export default function ProposalPageClient({
  slug,
  clientName,
}: ProposalPageClientProps) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [proposal, setProposal] = useState<SafeProposal | null>(null);

  // Pick up proposal data handed off from the /proposals list page via
  // sessionStorage. The server already issued an HttpOnly session cookie
  // during that verify call, so auth state lives in the cookie — the
  // access code is never stored or re-sent by client code.
  useEffect(() => {
    const stored = sessionStorage.getItem(`znas-proposal-${slug}`);
    if (stored) {
      try {
        const { proposal: data } = JSON.parse(stored);
        if (data) setProposal(data);
      } catch { /* ignore parse errors */ }
      sessionStorage.removeItem(`znas-proposal-${slug}`);
    }
  }, [slug]);

  // Mark that we're on a proposal page so ANY navigation away (including
  // browser back button) triggers the short "welcome back" preloader on
  // the home page. The unload listener disables bfcache in Chromium so
  // Home gets a fresh mount on browser back.
  useEffect(() => {
    sessionStorage.setItem("znas-page-transition", "1");
    const preventBfcache = () => {};
    window.addEventListener("unload", preventBfcache);
    return () => window.removeEventListener("unload", preventBfcache);
  }, []);

  const handleSuccess = useCallback(
    (data: SafeProposal) => {
      setTimeout(() => setProposal(data), 600);
    },
    []
  );

  // attachmentId is optional — when present the server returns the matching
  // proposal.attachments[] entry; when absent it returns the main PDF.
  // Filename for the saved file comes from the server's Content-Disposition
  // header so it stays correct per-proposal (the previous hardcoded
  // "Alebrijes_*.pdf" would have saved Haven's PDF under the wrong name).
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

  // On unmount clear the in-memory proposal and ask the server to drop
  // the session cookie. Best-effort — if the request fails (tab closed
  // mid-flight) the cookie will still expire on its own Max-Age.
  useEffect(() => {
    return () => {
      setProposal(null);
      fetch("/api/proposals/logout", {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
      }).catch(() => { /* tab closing, nothing to do */ });
    };
  }, []);

  return (
    <>
      <CustomCursor />

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
            ]}
            backHref="/proposals"
            backLabel={t.nav.back}
          />
          <ProposalViewer proposal={proposal} onDownload={handleDownload} />
          <Footer />
        </>
      )}
    </>
  );
}
