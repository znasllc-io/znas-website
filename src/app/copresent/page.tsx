import type { Metadata } from "next";
import ProductPage from "@/components/home/ProductPage";

export const metadata: Metadata = {
  title: "CoPresent — Multi-Agent Workspace | ZNAS LLC",
  description:
    "Real-time multi-agent collaboration workspace. The place where all your business data sources connect in a single space and become actionable intelligence.",
};

export default function CoPresentPage() {
  return <ProductPage product="copresent" />;
}
