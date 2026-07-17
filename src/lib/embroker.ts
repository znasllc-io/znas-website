/**
 * Embroker "Insured by" badge — configuration & OFF SWITCH.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Embroker lets us display their logo only under a licence that they can
 * revoke on 10 days' notice (and either party can end the whole agreement on
 * 30 days' notice). So the logo has to be removable from the ENTIRE site in
 * one move — never hunted for page by page. Everything Embroker-related is
 * therefore funnelled through this single file plus one component
 * (InsuredByEmbroker) rendered once in the shared SiteFooter.
 *
 * HOW TO TURN IT OFF
 * ------------------
 * Two ways, both a single change — pick whichever is easier at the time:
 *
 *   1. No code edit — set an environment variable in the deploy and rebuild:
 *          NEXT_PUBLIC_SHOW_EMBROKER_BADGE=false
 *      (add it to the Cloud Run / GitHub Actions build env). The badge then
 *      disappears everywhere on the next deploy.
 *
 *   2. One-line code edit — flip DEFAULT_SHOW below to `false` and deploy.
 *
 * When unset, the badge is SHOWN. Only the exact string "false" hides it, so
 * a typo can never accidentally take it down.
 */

/** Fallback used when NEXT_PUBLIC_SHOW_EMBROKER_BADGE is not set. */
const DEFAULT_SHOW = true;

export const SHOW_EMBROKER_BADGE =
  process.env.NEXT_PUBLIC_SHOW_EMBROKER_BADGE === "false"
    ? false
    : process.env.NEXT_PUBLIC_SHOW_EMBROKER_BADGE === "true"
      ? true
      : DEFAULT_SHOW;

/**
 * The one piece of copy allowed next to the logo. The licence limits text to
 * referencing that we carry Embroker coverage — nothing implying endorsement
 * or certification ("Embroker Certified/Approved/Recommended" are NOT allowed).
 */
export const EMBROKER_STATEMENT = "ZNAS is insured by Embroker";
