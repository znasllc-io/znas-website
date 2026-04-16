import fs from "fs";
import path from "path";

export interface ProposalRoadmapPhase {
  phase: string;
  description: string;
  deliverables: string[];
}

export interface ProposalMilestone {
  milestone: string;
  date: string;
  status: "upcoming" | "in-progress" | "complete";
}

export interface ProposalTier {
  name: string;
  price: string;
  description: string;
  includes: string[];
  recommended?: boolean;
}

export interface ProposalSections {
  summary: {
    headline: string;
    body: string;
    highlights: string[];
  };
  roadmap: ProposalRoadmapPhase[];
  timeline: ProposalMilestone[];
  investment: {
    description: string;
    tiers: ProposalTier[];
  };
}

export interface Proposal {
  slug: string;
  clientName: string;
  projectTitle: string;
  password: string;
  status: "active" | "draft" | "archived";
  pdfFilename: string;
  sections: ProposalSections;
}

// Safe proposal data (password stripped)
export type SafeProposal = Omit<Proposal, "password">;

const PROPOSALS_DIR = path.join(process.cwd(), "data", "proposals");

/**
 * Sanitize slug — only allow lowercase alphanumeric + hyphens.
 * Prevents path traversal attacks.
 */
function sanitizeSlug(slug: string): string | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  return slug;
}

/**
 * Load a single proposal by slug. Returns null if not found or invalid slug.
 */
export function loadProposal(slug: string): Proposal | null {
  const safe = sanitizeSlug(slug);
  if (!safe) return null;

  const filePath = path.join(PROPOSALS_DIR, `${safe}.json`);

  // Defense in depth: verify resolved path stays within proposals directory
  const resolved = path.resolve(filePath);
  const baseDir = path.resolve(PROPOSALS_DIR);
  if (!resolved.startsWith(baseDir + path.sep) && resolved !== baseDir) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Proposal;
  } catch {
    return null;
  }
}

/**
 * Load all proposals (for the list page). Returns safe data only (no passwords).
 */
export function loadAllProposals(): Pick<SafeProposal, "slug" | "clientName" | "projectTitle" | "status">[] {
  try {
    const files = fs.readdirSync(PROPOSALS_DIR).filter((f) => f.endsWith(".json"));
    return files.map((file) => {
      const raw = fs.readFileSync(path.join(PROPOSALS_DIR, file), "utf-8");
      const proposal = JSON.parse(raw) as Proposal;
      return {
        slug: proposal.slug,
        clientName: proposal.clientName,
        projectTitle: proposal.projectTitle,
        status: proposal.status,
      };
    }).filter((p) => p.status === "active");
  } catch {
    return [];
  }
}

/**
 * Strip password from proposal for safe client-side use.
 */
export function toSafeProposal(proposal: Proposal): SafeProposal {
  const { password, ...safe } = proposal;
  return safe;
}
