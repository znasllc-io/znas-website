"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  const passwordRef = useRef<string>("");

  // Check sessionStorage for pre-auth from inline code entry
  useEffect(() => {
    const stored = sessionStorage.getItem(`znas-proposal-${slug}`);
    if (stored) {
      try {
        const { proposal: data, password } = JSON.parse(stored);
        setProposal(data);
        passwordRef.current = password;
      } catch { /* ignore parse errors */ }
      sessionStorage.removeItem(`znas-proposal-${slug}`);
    }
  }, [slug]);

  // Mark that we're on a proposal page so ANY navigation away (including
  // browser back button) triggers the short "welcome back" preloader on
  // the home page.
  useEffect(() => {
    sessionStorage.setItem("znas-page-transition", "1");
  }, []);

  const handleSuccess = useCallback(
    (data: SafeProposal, password: string) => {
      passwordRef.current = password;
      setTimeout(() => setProposal(data), 600);
    },
    []
  );

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch("/api/proposals/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password: passwordRef.current, lang }),
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
  }, [slug, lang]);

  // Security: clear proposal data on unmount
  useEffect(() => {
    return () => {
      setProposal(null);
      passwordRef.current = "";
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
