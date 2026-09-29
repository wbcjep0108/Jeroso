import type { Metadata } from "next";
import InsightsSection from "@/components/sections/InsightsSection";

export const metadata: Metadata = {
  title: "Insights",
  description: "Short guides to the wine regions behind the Jeroso collection.",
};

// Same section component as the homepage, rendered as the page's main heading.
export default function InsightsPage() {
  return <InsightsSection context="page" />;
}