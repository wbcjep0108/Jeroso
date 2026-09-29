import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <ComingSoon
      title="Search"
      description="Search across wines, regions, and grapes is being built."
    />
  );
}
