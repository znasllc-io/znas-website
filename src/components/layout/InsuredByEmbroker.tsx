import { EMBROKER_STATEMENT } from "@/lib/embroker";

/**
 * Embroker "Insured by" trust badge.
 *
 * Licence constraints this component encodes (do not "fix" these lightly):
 *  - Uses the delivered logo file verbatim (/images/embroker.png). The mark is
 *    never recreated in another typeface or re-vectorised.
 *  - Black logo only, on a LIGHT surface. The footer is dark, so the logo sits
 *    on its own white chip rather than being recoloured or made translucent.
 *  - Original ~8:1 proportion is preserved (height set, width auto).
 *  - Copy references coverage only — no endorsement/certification wording.
 *
 * Rendered once (in SiteFooter) and gated by SHOW_EMBROKER_BADGE so it can be
 * removed site-wide from a single place. See src/lib/embroker.ts.
 *
 * Visually: the caption "ZNAS is insured by" is followed by the logo, which is
 * the word "Embroker" — so it reads as EMBROKER_STATEMENT. The full sentence is
 * exposed to assistive tech via the group's aria-label.
 */
export default function InsuredByEmbroker() {
  // "ZNAS is insured by Embroker" → lead-in is everything before the final word,
  // which the logo itself supplies. Falls back gracefully if the copy changes.
  const leadIn = EMBROKER_STATEMENT.replace(/\s*Embroker\s*$/i, "");

  return (
    <div
      role="group"
      aria-label={EMBROKER_STATEMENT}
      className="flex items-center"
      style={{ gap: "0.7rem" }}
    >
      <span
        className="fde-label"
        aria-hidden="true"
        style={{
          fontSize: "0.56rem",
          letterSpacing: "0.2em",
          color: "var(--fde-white)",
          whiteSpace: "nowrap",
        }}
      >
        {leadIn}
      </span>

      {/* White chip: gives the black logo the light background the licence
          requires, without recolouring it. inline-block (not flex) so the
          image keeps its intrinsic ~8:1 ratio via width:auto — as a flex item
          it would collapse to 0 width in Chrome. */}
      <span
        style={{
          display: "inline-block",
          flexShrink: 0,
          background: "#ffffff",
          borderRadius: "5px",
          padding: "5px 9px",
          lineHeight: 0,
        }}
      >
        {/* Explicit px dimensions kept exactly proportional to the delivered
            622×77 file (15 × 622/77 ≈ 121). Explicit width avoids Tailwind
            Preflight's img reset collapsing width:auto to 0. To resize, scale
            both numbers together so the ~8:1 ratio is never distorted. */}
        <img
          src="/images/embroker.png"
          alt="Embroker"
          width={622}
          height={77}
          style={{ width: "121px", height: "15px", maxWidth: "none", display: "block" }}
        />
      </span>
    </div>
  );
}
