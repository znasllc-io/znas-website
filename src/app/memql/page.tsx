import type { Metadata } from "next";
import ProductPage from "@/components/home/ProductPage";

export const metadata: Metadata = {
  title: "MemQL — Open Source AI Infrastructure | ZNAS LLC",
  description:
    "Distributed AI-native memory graph built for production agent systems. Open-source memory layer for AI agents, built as a declarative language.",
};

export default function MemqlPage() {
  return <ProductPage product="memql" />;
}
