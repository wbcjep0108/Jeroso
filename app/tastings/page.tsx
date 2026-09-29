import type { Metadata } from "next";
import TastingsSection from "@/components/sections/TastingsSection";

export const metadata: Metadata = {
  title: "Tastings",
  description: "Guided and private wine tastings at Jeroso.",
};

// Same section component as the homepage, rendered as the page's main heading.
export default function TastingsPage() {
  return <TastingsSection context="page" />;
}