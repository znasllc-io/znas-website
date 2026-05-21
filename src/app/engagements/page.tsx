import type { Metadata } from "next";
import ProposalListClient from "@/components/proposals/ProposalListClient";
import { loadAllProposals } from "@/lib/proposals";

export const metadata: Metadata = {
  title: "Engagements | ZNAS",
  description: "Access your ZNAS engagements.",
};

export default function ProposalsPage() {
  const proposals = loadAllProposals();
  return <ProposalListClient proposals={proposals} />;
}
