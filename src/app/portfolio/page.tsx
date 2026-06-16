import type { Metadata } from "next";
import PortfolioClient from "@/components/portfolio/PortfolioClient";

export const metadata: Metadata = {
  title: "Technical Portfolio | José Sanz | ZNAS LLC",
  description:
    "17 years engineering distributed systems at scale. Healthcare, airlines, finance, telecom. MIT AI certified. Founder of ZNAS LLC.",
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}
