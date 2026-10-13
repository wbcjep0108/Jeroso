import type { Metadata } from "next";
import InsightsSection from "@/components/sections/InsightsSection";
import InsightsPageExperience from "@/components/sections/InsightsPageExperience";

export const metadata: Metadata = {
  title: "Insights",
  description: "Short guides to the wine regions behind the Jeroso collection.",
};

export default function InsightsPage() {
  return (
    <InsightsPageExperience>
      <InsightsSection context="page" showHeader={false} />
    </InsightsPageExperience>
  );
}
