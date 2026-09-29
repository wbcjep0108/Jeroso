import type { Metadata } from "next";
import AboutSection from "@/components/sections/AboutSection";

export const metadata: Metadata = {
  title: "About",
  description: "Jeroso and the J.E.N. idea: the journey, the essence, the nectar.",
};

// Same section component as the homepage, rendered as the page's main heading.
export default function AboutPage() {
  return <AboutSection context="page" />;
}