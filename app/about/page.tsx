import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <ComingSoon
      title="About"
      description="The people and philosophy behind Jeroso: the journey, the essence, the nectar."
    />
  );
}
