/**
 * Person + Organization structured data (JSON-LD) for José Sanz / ZNAS LLC.
 * Rendered on the homepage and the dedicated /about page so search engines can
 * associate the founder, his role, location, credentials, and profiles
 * (E-E-A-T signals). Shared from one place so the two pages never drift.
 */
export const personOrgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://znas.io/#jose-sanz",
      name: "José Sanz",
      jobTitle: "Forward Deployed AI Engineer",
      description:
        "Forward Deployed AI Engineer and founder of ZNAS LLC. Embeds with client teams to take stalled AI initiatives from pilot to running production.",
      url: "https://znas.io/about",
      email: "znas@znas.io",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Arizona",
        addressCountry: "US",
      },
      alumniOf: { "@type": "Organization", name: "MIT Sloan School of Management" },
      knowsAbout: [
        "Forward Deployed Engineering",
        "Artificial Intelligence",
        "Production AI systems",
        "Retrieval pipelines",
        "Agent infrastructure",
        "LLM integration",
      ],
      sameAs: ["https://www.linkedin.com/in/znas-io/", "https://github.com/znas-io"],
      worksFor: { "@id": "https://znas.io/#znas-llc" },
    },
    {
      "@type": "Organization",
      "@id": "https://znas.io/#znas-llc",
      name: "ZNAS LLC",
      description: "Forward Deployed AI Engineering firm.",
      url: "https://znas.io",
      email: "znas@znas.io",
      areaServed: "US",
      founder: { "@id": "https://znas.io/#jose-sanz" },
      sameAs: ["https://www.linkedin.com/in/znas-io/", "https://github.com/znas-io"],
    },
  ],
};
