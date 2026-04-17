"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { SafeProposal } from "@/lib/proposals";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import PasswordGate from "./PasswordGate";
import ProposalViewer from "./ProposalViewer";
import CustomCursor from "@/components/layout/CustomCursor";
import GrainOverlay from "@/components/layout/GrainOverlay";

interface ProposalPageClientProps {
  slug: string;
  clientName: string;
}

export default function ProposalPageClient({
  slug,
  clientName,
}: ProposalPageClientProps) {
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
        body: JSON.stringify({ slug, password: passwordRef.current }),
      });

      if (!res.ok) {
        alert("Unable to download. Please refresh and try again.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-proposal.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. Please try again.");
    }
  }, [slug]);

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
      <GrainOverlay />

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
              { label: "Summary", href: "#summary" },
              { label: "Roadmap", href: "#roadmap" },
              { label: "Timeline", href: "#timeline" },
              { label: "Investment", href: "#investment" },
            ]}
            backHref="/proposals"
            backLabel="Back"
          />
          <ProposalViewer proposal={proposal} onDownload={handleDownload} />
          <Footer />
        </>
      )}
    </>
  );
}
