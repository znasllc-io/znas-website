import type { Metadata } from "next";
import CaseStudyPage from "@/components/home/CaseStudyPage";

export const metadata: Metadata = {
  title: "Manufacturing — Safety & Productivity | ZNAS LLC",
  description:
    "Vision AI that enforces compliance and surfaces lost productivity without adding headcount.",
};

export default function ManufacturingCaseStudy() {
  return <CaseStudyPage slug="manufacturing" />;
}
