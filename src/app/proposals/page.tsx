import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import ProposalListClient from "@/components/proposals/ProposalListClient";

export const metadata: Metadata = {
  title: "Proposals — ZNAS",
  description: "Access your ZNAS project proposal.",
};

interface ProposalEntry {
  slug: string;
  clientName: string;
  projectTitle: string;
}

function loadProposalList(): ProposalEntry[] {
  const dir = path.join(process.cwd(), "data", "proposals");
  try {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    return files
      .map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), "utf-8");
        const data = JSON.parse(raw);
        if (data.status !== "active") return null;
        return {
          slug: data.slug,
          clientName: data.clientName,
          projectTitle: data.projectTitle,
        };
      })
      .filter(Boolean) as ProposalEntry[];
  } catch {
    return [];
  }
}

export default function ProposalsPage() {
  const proposals = loadProposalList();
  return <ProposalListClient proposals={proposals} />;
}
