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

/**
 * "Real Estate Agent" section. Surfaces a forward-looking deliverable
 * that's already in build (an AI agent for property research/bidding).
 * Pure narrative, no inline download (the agent isn't a deliverable yet).
 * Used by the Haven proposal to call out a concrete real-estate-side
 * outcome alongside the gameplan-focused Initiative section.
 */
export interface ProposalRealEstateAgent {
  headline: string;
  body?: string;
  intro?: string;
  points?: { title: string; body: string }[];
  note?: string;
}

/**
 * "How It Works" section. Replaces the old long-form Roadmap on lean
 * proposals (e.g. Haven) where the work-structure detail belongs in the
 * downloadable PDF, not on the page. Renders as: short intro paragraph,
 * then a 2x2 (or 1x4 on mobile) grid of small cards.
 */
export interface ProposalHowItWorks {
  intro: string;
  cards: { title: string; body: string }[];
}

/**
 * "The Team" section. A single-person team block for solo or
 * solo-led engagements: name, short tagline, secondary caption, optional
 * photo. The photo path is served from /public so it must live there.
 */
export interface ProposalTeamMember {
  name: string;
  tagline: string;
  caption: string;
  photo?: string;
}

export interface ProposalTeam extends ProposalTeamMember {
  // Additional team members rendered below the lead.
  members?: ProposalTeamMember[];
}

/**
 * Optional override for the bottom Download CTA copy. When omitted, the
 * viewer falls back to the global i18n strings in translations.ts. Lets
 * a single proposal customize the closing line without changing the
 * shared i18n strings (which would affect every other proposal).
 */
export interface ProposalDownloadCta {
  headline?: string;
  subtitle?: string;
}

/**
 * "Supporting Documents" section. A grid of document cards, each with a title,
 * short description, and a "View Document" button that downloads a gated PDF
 * via attachmentId (must reference an entry in proposal.attachments[]). Used
 * for proposals whose deliverable is a set of documents rather than a single
 * main PDF (e.g. an engagement position + a value estimate).
 */
export interface ProposalDocCard {
  title: string;
  description: string;
  // References proposal.attachments[i].id — the gated download for this card.
  attachmentId: string;
}

export interface ProposalSections {
  summary: {
    headline: string;
    // Plain prose. Multi-paragraph supported via \n\n split at render.
    body: string;
    // Optional now: lean proposals can omit the highlights grid entirely.
    highlights?: string[];
  };
  // Optional. Renders right after Summary as a grid of document cards.
  supportingDocuments?: ProposalDocCard[];
  // Long-form phase-by-phase roadmap. Optional: lean proposals can use
  // `howItWorks` instead, or omit work-structure detail entirely (and
  // let it live in the PDF).
  roadmap?: ProposalRoadmapPhase[];
  // Short-form work-structure section: 4 small cards with an intro line.
  // Mutually optional with `roadmap` — a proposal typically has one or
  // the other, not both. Renders second when present (after Summary).
  howItWorks?: ProposalHowItWorks;
  // Optional. Date-driven milestones list (proposal sent, alignment
  // meeting, agreement, kickoff). Lean proposals omit this and let the
  // schedule live in email follow-ups.
  timeline?: ProposalMilestone[];
  // Optional. Pricing tiers. Lean proposals omit and confirm pricing in
  // the alignment meeting / PDF instead of on the page.
  investment?: {
    description: string;
    tiers: ProposalTier[];
  };
  // Optional. Renders after the work-structure / pricing sections and
  // before Initiative.
  team?: ProposalTeam;
  // Optional. Surfaces a supplementary document (typically a gameplan)
  // inline with a short narrative explaining what it is. Any attachment
  // referenced via attachmentId is hidden from the bottom Download CTA's
  // secondary-button list to avoid showing the same file twice.
  initiative?: ProposalInitiative;
  // Optional. Forward-looking deliverable already in build (e.g. the
  // Haven real estate agent). Renders after Initiative.
  realEstateAgent?: ProposalRealEstateAgent;
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
  // Optional for `completed` engagements — historical records with no gated content.
  passwordHash?: string;
  // Lifecycle:
  //   draft      — internal, hidden from listing
  //   active     — published; if expiresAt has passed, the listing card
  //                renders an "Unrealized" + Reengage variant instead of
  //                the password-entry flow
  //   formalized — proposal converted to an active engagement; listing
  //                renders a quieter "in progress" badge
  //   completed  — engagement finished; rendered in the Inactive section
  //                as a muted, read-only historical record
  //   archived   — hidden from listing
  status: "active" | "draft" | "archived" | "formalized" | "completed";
  // Optional ISO date (YYYY-MM-DD or full ISO). Drives the live
  // countdown on Active cards and the Expired/Unrealized transition.
  expiresAt?: string;
  // Optional ISO date for `completed` engagements. Used to sort the
  // Inactive section (most recent first).
  completedAt?: string;
  // Optional short summary surfaced on Inactive (completed) cards in place
  // of the password-entry flow. One sentence — what the engagement covered.
  summary?: string;
  summary_es?: string;
  // Optional. Completed engagements don't need a PDF.
  pdfFilename?: string;
  pdfFilenameEs?: string;
  // Optional supplementary downloads (rendered as additional buttons next
  // to the main PDF download). Same auth + path validation rules apply.
  attachments?: ProposalAttachment[];
  // Optional override for the bottom Download CTA headline + subtitle.
  // Falls back to translations.ts strings when absent. Lets one proposal
  // customize closing copy without touching the shared i18n.
  downloadCta?: ProposalDownloadCta;
  // Optional one-line note rendered above the bottom Download CTA as
  // quiet body text (no card, no badge). Used to surface a small
  // pricing/terms reassurance without giving it its own section.
  closingNote?: string;
  // Required at the type level even though completed engagements omit it
  // in their JSON. The runtime invariant: only `active`/`formalized` entries
  // ever flow through code paths that read `sections` (the viewer + its
  // server fetch), so the missing field on a completed JSON is unreachable.
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

export type ProposalListEntry = Pick<
  SafeProposal,
  "slug" | "clientName" | "projectTitle" | "projectTitle_es" | "expiresAt" | "completedAt" | "summary" | "summary_es"
> & {
  // Narrower than Proposal.status — the loader filters out `draft`,
  // so consumers of the list never see drafts.
  status: "active" | "formalized" | "completed" | "archived";
  // Whether the entry has gated content available to view. Derived from
  // `passwordHash` presence — completed engagements and lightweight
  // "in progress" placeholders with no PDF/password set this to false so
  // the card renders as non-interactive (no password input).
  hasAccess: boolean;
};

/**
 * Load all proposals (for the list page). Returns safe data only (no passwords).
 * Includes active, formalized, and completed entries — `draft` and `archived`
 * remain hidden.
 */
export function loadAllProposals(): ProposalListEntry[] {
  try {
    const files = fs.readdirSync(PROPOSALS_DIR).filter((f) => f.endsWith(".json"));
    const entries: ProposalListEntry[] = [];
    for (const file of files) {
      const raw = fs.readFileSync(path.join(PROPOSALS_DIR, file), "utf-8");
      const proposal = JSON.parse(raw) as Proposal;
      if (
        proposal.status !== "active" &&
        proposal.status !== "formalized" &&
        proposal.status !== "completed" &&
        proposal.status !== "archived"
      ) {
        continue;
      }
      entries.push({
        slug: proposal.slug,
        clientName: proposal.clientName,
        projectTitle: proposal.projectTitle,
        projectTitle_es: proposal.projectTitle_es,
        status: proposal.status,
        expiresAt: proposal.expiresAt,
        completedAt: proposal.completedAt,
        summary: proposal.summary,
        summary_es: proposal.summary_es,
        hasAccess: Boolean(proposal.passwordHash),
      });
    }
    return entries;
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
