"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { SafeProposal } from "@/lib/proposals";
import ProposalNav from "./ProposalNav";
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

  const handleSuccess = useCallback(
    (data: SafeProposal, password: string) => {
      passwordRef.current = password;
      // Small delay to let the exit animation complete
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

  // Security: clear proposal data on unmount (browser history/back nav)
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
          <ProposalNav title="Proposal" />
          <ProposalViewer proposal={proposal} onDownload={handleDownload} />
        </>
      )}
    </>
  );
}
