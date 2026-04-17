import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProposalPageClient from "@/components/proposals/ProposalPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Server component — reads ONLY the client name from the JSON file.
 * No proposal content, no password, no sections are passed to the client.
 * This prevents any proposal data from leaking into the initial HTML/JS payload.
 */
function getClientMeta(slug: string): { clientName: string; projectTitle: string } | null {
  // Sanitize slug server-side
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const filePath = path.join(process.cwd(), "data", "proposals", `${slug}.json`);

  // Verify resolved path is within the proposals directory (defense in depth)
  const resolved = path.resolve(filePath);
  const baseDir = path.resolve(path.join(process.cwd(), "data", "proposals"));
  if (!resolved.startsWith(baseDir)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    if (data.status !== "active") return null;
    return {
      clientName: data.clientName as string,
      projectTitle: data.projectTitle as string,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getClientMeta(slug);
  return {
    title: meta ? `${meta.clientName} | Proposal | ZNAS` : "Proposal | ZNAS",
    description: "Access your ZNAS project proposal.",
  };
}

export default async function ProposalPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = getClientMeta(slug);

  if (!meta) {
    notFound();
  }

  // Only pass slug + clientName to the client. Zero proposal content.
  return (
    <ProposalPageClient
      slug={slug}
      clientName={meta.clientName}
    />
  );
}
