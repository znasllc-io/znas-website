import type { Metadata } from "next";
import ProposalListClient from "@/components/proposals/ProposalListClient";
import { loadAllProposals } from "@/lib/proposals";

export const metadata: Metadata = {
  title: "Engagements | ZNAS",
  description: "Access your ZNAS engagements.",
};

// Render per-request so the listing always reflects the current proposal
// JSONs (access-window deadlines included) rather than a build-time
// snapshot. Deadlines are static config, but the expired-card flip must
// not wait for the next rebuild.
export const dynamic = "force-dynamic";

export default function ProposalsPage() {
  const proposals = loadAllProposals();
  return <ProposalListClient proposals={proposals} />;
}
