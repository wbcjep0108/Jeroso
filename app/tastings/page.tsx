import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Tastings" };

export default function TastingsPage() {
  return (
    <ComingSoon
      title="Tastings"
      description="Guided tastings and sommelier-led evenings. Dates and booking will appear here."
    />
  );
}
