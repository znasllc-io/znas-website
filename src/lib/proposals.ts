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
  description?: string;
}

export interface ProposalTier {
  name: string;
  price: string;
  description: string;
  includes: string[];
  recommended?: boolean;
}

/**
 * Optional "Initiative" section. Used to surface a supplementary document
 * (typically a gameplan or pre-engagement plan) inline with a short
 * narrative explaining what it is. The download is gated through the same
 * /api/proposals/download endpoint as everything else — `attachmentId`
 * MUST reference an entry in proposal.attachments[]; the section will not
 * render its button if the lookup fails.
 */
export interface ProposalInitiative {
  headline: string;
  body: string; // multi-paragraph; split on \n\n for rendering
  // References proposal.attachments[i].id. Optional — section can also
  // exist as pure narrative without a download (renders text only).
  attachmentId?: string;
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
  // Optional. When present, rendered as section .05 between Investment
  // and the bottom Download CTA. Any attachment referenced here is hidden
  // from the bottom CTA's secondary-button list to avoid duplication.
  initiative?: ProposalInitiative;
}

/**
 * Optional supplementary downloads shown alongside the main proposal PDF
 * (gameplans, addenda, reports, etc.). Each attachment is gated through
 * the same /api/proposals/download endpoint as the main PDF — the session
 * cookie must match the proposal slug, and the filename has to match the
 * `^[a-z0-9-]+\.pdf$` pattern. The path-traversal check on the resolved
 * filesystem path provides defense in depth.
 */
export interface ProposalAttachment {
  // url-safe id, e.g. "gameplan". Used in the download API as attachmentId.
  id: string;
  // PDF filename inside data/proposals/pdfs/ — must match ^[a-z0-9-]+\.pdf$
  filename: string;
  // Label shown on the download button (English).
  label: string;
  // Optional Spanish label.
  label_es?: string;
}

export interface Proposal {
  slug: string;
  clientName: string;
  projectTitle: string;
  projectTitle_es?: string;
  // Argon2id hash of the access code. Never stored or transmitted in plaintext.
  passwordHash: string;
  status: "active" | "draft" | "archived";
  pdfFilename: string;
  pdfFilenameEs?: string;
  // Optional supplementary downloads (rendered as additional buttons next
  // to the main PDF download). Same auth + path validation rules apply.
  attachments?: ProposalAttachment[];
  sections: ProposalSections;
  sections_es?: ProposalSections;
}

// Safe proposal data (hash stripped)
export type SafeProposal = Omit<Proposal, "passwordHash">;

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
 * Strip password hash from proposal for safe client-side use.
 */
export function toSafeProposal(proposal: Proposal): SafeProposal {
  const { passwordHash: _h, ...safe } = proposal;
  return safe;
}
