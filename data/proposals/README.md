# Proposal data

Proposal JSONs in this directory (`*.json`, except `*.example.json`) are
**gitignored**. They contain client-sensitive content and a per-proposal
argon2id password hash. Never commit them.

## Schema

See `proposal.example.json` for the full schema. Required fields:

- `slug` — URL segment. Must match `^[a-z0-9-]+$`. The filename must be
  `<slug>.json`.
- `clientName`, `projectTitle`, `status: "active" | "draft" | "archived"`
- `passwordHash` — argon2id hash of the access code. Generated with
  `node scripts/hash-password.mjs`. **Never store the plaintext code
  here.** The plaintext lives only in the secure channel used to deliver
  it to the client (e.g. 1Password share, Signal).
- `sentAt` (optional) — ISO datetime the code was DELIVERED to the client.
  Starts the access window. See "Access windows" below.
- `accessWindowDays` (optional, default 30) — length of the access window,
  counted from `sentAt`.
- `pdfFilename` (+ optional `pdfFilenameEs`) — PDF file inside
  `data/proposals/pdfs/`, matching `^[a-z0-9-]+\.pdf$`.
- `sections` — proposal content; see the example for the full shape.

## Workflow

### Creating a new proposal

1. `cp data/proposals/proposal.example.json data/proposals/<slug>.json`
2. Fill in the content.
3. Generate a fresh access code + hash:
   `node scripts/hash-password.mjs`
   Copy the `HASH` into `passwordHash`. Deliver the `CODE` to the client
   via a secure side channel. Never paste it into email or chat.
4. Drop the PDF(s) into `data/proposals/pdfs/`.
5. Deploy. The `<slug>.json` is NOT in the git repo — ship it via your
   deployment's secret/config mechanism (mounted volume, Vercel env,
   1Password Secrets Automation, etc.).

### Rotating an access code

1. `node scripts/hash-password.mjs` — produces a new code + hash.
2. Replace the `passwordHash` value in the proposal JSON.
3. Deliver the new code to the client over a secure channel.
4. Redeploy.

## Access windows

A gated proposal can carry an access window: the code works for a fixed
number of days, then stops. It's plain static config — no runtime state,
no external services.

- Set `sentAt` to the datetime you delivered the code to the client
  (ISO 8601, e.g. `"2026-06-20T15:00:00-07:00"`).
- The window closes at `sentAt + accessWindowDays` (default 30). The
  countdown is measured from delivery, NOT from when the client first
  opens the link — a code sent 10 days ago shows 20 days left.
- `src/lib/proposals.ts` → `effectiveExpiresAt()` is the single source of
  truth. It's enforced in the verify/download/demo API routes and drives
  the listing countdown, the expired-card flip, and the viewer's
  "access ends in Xd" header line.

When the window closes, the code stops working for everyone (there's no
separate team bypass), and the listing card flips to the "Contact us"
re-engage treatment. **To re-open access, bump `sentAt` (or remove it)
and redeploy** — the whole window lives in the committed JSON, so a
redeploy is all it takes.

A proposal with no `sentAt` and no `expiresAt` has no window: the code
works indefinitely.

## Why this file isn't in git

Prior to the Q2 2026 security hardening pass, a proposal JSON was
committed to the repo with a plaintext password (and that password
happened to be the RFC 4122 example UUID). Moving proposal JSONs out
of version control means:

- Client content cannot leak through repo access (contractors, past
  collaborators, accidental public repos).
- No future plaintext credential can end up in git history.
- The example file is sufficient for anyone bootstrapping a new env.
