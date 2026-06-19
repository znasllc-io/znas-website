"use client";

import Reveal from "./Reveal";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

function Question({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start" style={{ gap: "0.9rem" }}>
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          border: "1px solid var(--fde-blue)",
          color: "var(--fde-blue)",
          fontSize: "0.65rem",
          marginTop: "0.15rem",
        }}
      >
        →
      </span>
      <h3
        className="fde-headline"
        style={{ fontSize: "1rem", fontWeight: 800, color: "var(--fde-blue)", lineHeight: 1.35 }}
      >
        {children}
      </h3>
    </div>
  );
}

function Answer({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: "0.8rem",
        marginLeft: "2.3rem",
        fontSize: "0.84rem",
        lineHeight: 1.7,
        color: "var(--fde-gray)",
      }}
    >
      {children}
    </div>
  );
}

export default function Faq() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].faq;

  return (
    <section id="faq" className="fde-container" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
      <div className="grid md:grid-cols-[160px_minmax(0,1fr)]" style={{ gap: "3rem" }}>
        <Reveal>
          <div className="fde-headline" style={{ fontSize: "3.4rem", lineHeight: 0.95 }}>
            FA
            <span style={{ color: "var(--fde-blue)" }}>Q</span>
          </div>
        </Reveal>

        {/* minWidth:0 lets this column shrink to the grid track so the wide
            comparison table scrolls inside its own overflow box instead of
            stretching the page (which shoved mobile content left). */}
        <div className="flex flex-col" style={{ gap: "3rem", minWidth: 0 }}>
          {t.items.map((item, i) => (
            <Reveal key={item.q}>
              <Question>{item.q}</Question>
              <Answer>
                {i === 1 ? (
                  <>
                    {/* Desktop: side-by-side comparison table */}
                    <div className="hidden md:block">
                      <table className="fde-table">
                        <thead>
                          <tr>
                            <th></th>
                            <th>{t.tableHeadCto}</th>
                            <th>{t.tableHeadFde}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {t.tableRows.map(([label, cto, fde]) => (
                            <tr key={label}>
                              <td className="fde-td-label">{label}</td>
                              <td>{cto}</td>
                              <td>{fde}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile: stacked comparison cards (the table is too wide
                        for phones — each row compares the two roles vertically) */}
                    <div className="md:hidden flex flex-col" style={{ gap: "0.85rem" }}>
                      {t.tableRows.map(([label, cto, fde]) => (
                        <div
                          key={label}
                          className="fde-card-grad"
                          style={{ borderRadius: "12px", padding: "1rem 1.1rem" }}
                        >
                          <p
                            className="fde-label"
                            style={{ fontSize: "0.58rem", letterSpacing: "0.18em", color: "var(--fde-gray-dim)" }}
                          >
                            {label}
                          </p>
                          <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                            <div>
                              <span
                                style={{
                                  fontSize: "0.6rem",
                                  letterSpacing: "0.12em",
                                  textTransform: "uppercase",
                                  color: "var(--fde-gray-dim)",
                                }}
                              >
                                {t.tableHeadCto}
                              </span>
                              <p style={{ marginTop: "0.2rem", fontSize: "0.86rem", lineHeight: 1.5, color: "var(--fde-gray)" }}>
                                {cto}
                              </p>
                            </div>
                            <div>
                              <span
                                style={{
                                  fontSize: "0.6rem",
                                  letterSpacing: "0.12em",
                                  textTransform: "uppercase",
                                  color: "var(--fde-blue)",
                                }}
                              >
                                {t.tableHeadFde}
                              </span>
                              <p style={{ marginTop: "0.2rem", fontSize: "0.86rem", lineHeight: 1.5, color: "var(--fde-blue)", fontWeight: 500 }}>
                                {fde}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  item.a
                )}
              </Answer>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
