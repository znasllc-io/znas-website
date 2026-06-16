/**
 * Shared nav brand lockup — owl mark + wordmark in the FDE label voice.
 * Used by both the main-site nav (HomeNav) and the portfolio Navigation so
 * the brand reads pixel-identical across the whole site.
 *
 * `full` controls when the long wordmark appears: the main-site nav has few
 * links so it can show it from `sm` up; the portfolio nav is dense (status
 * badge + section links + controls) so it stays compact until `xl`.
 */
export default function BrandLockup({
  full = false,
  compact = false,
}: {
  full?: boolean;
  /** Force the short "ZNAS LLC" lockup at every width (used by the dense
   * portfolio nav to reclaim bar space). */
  compact?: boolean;
}) {
  return (
    <span className="fde-nav-brand" style={{ pointerEvents: "none" }}>
      <img src="/logo.png" alt="" style={{ height: "22px", width: "auto" }} />
      {compact ? (
        <span>ZNAS LLC</span>
      ) : (
        <>
          <span className={full ? "hidden sm:inline" : "hidden 2xl:inline"}>
            ZNAS LLC — FORWARD DEPLOYED ENGINEERING
          </span>
          <span className={full ? "sm:hidden" : "2xl:hidden"}>ZNAS LLC</span>
        </>
      )}
    </span>
  );
}
