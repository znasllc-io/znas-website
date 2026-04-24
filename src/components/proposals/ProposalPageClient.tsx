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

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch("/api/proposals/download", {
        method: "POST",
        // credentials: "same-origin" is default; explicit here to signal
        // that the HttpOnly session cookie is the auth mechanism.
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, lang }),
      });

      if (!res.ok) {
        alert(t.proposals.viewer.download.errorRefresh);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = lang === "es" ? "Alebrijes_ES.pdf" : "Alebrijes_EN.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert(t.proposals.viewer.download.errorFailed);
    }
  }, [slug, lang, t.proposals.viewer.download.errorRefresh, t.proposals.viewer.download.errorFailed]);

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
            navOverride={[
              { label: t.proposals.viewer.nav.summary, href: "#summary" },
              { label: t.proposals.viewer.nav.roadmap, href: "#roadmap" },
              { label: t.proposals.viewer.nav.timeline, href: "#timeline" },
              { label: t.proposals.viewer.nav.investment, href: "#investment" },
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
