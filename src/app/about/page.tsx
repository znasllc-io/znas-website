import type { Metadata } from "next";
import AboutPage from "@/components/home/AboutPage";
import { personOrgJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "About José Sanz — Forward Deployed AI Engineer | ZNAS LLC",
  description:
    "José Sanz is a Forward Deployed AI Engineer and founder of ZNAS LLC — he embeds with client teams to take stalled AI initiatives from pilot to running production, and owns the outcome until it runs.",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personOrgJsonLd) }}
      />
      <AboutPage />
    </>
  );
}
