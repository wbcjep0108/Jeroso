import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Insights" };

export default function InsightsPage() {
  return (
    <ComingSoon
      title="Insights"
      description="Notes on regions, grapes, and pairings from our sommeliers. Articles are on the way."
    />
  );
}
