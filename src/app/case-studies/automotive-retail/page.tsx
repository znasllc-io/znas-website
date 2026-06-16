import type { Metadata } from "next";
import CaseStudyPage from "@/components/home/CaseStudyPage";

export const metadata: Metadata = {
  title: "Automotive Retail — Customer Engagement & Premises Security | ZNAS LLC",
  description:
    "One AI system handling inquiries, lead capture, and security monitoring around the clock.",
};

export default function AutomotiveRetailCaseStudy() {
  return <CaseStudyPage slug="automotive-retail" />;
}
