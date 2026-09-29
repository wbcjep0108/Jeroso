import type { Metadata } from "next";
import ContactSection from "@/components/sections/ContactSection";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Jeroso about a wine or a private tasting.",
};

// Same section component as the homepage, rendered as the page's main heading.
export default function ContactPage() {
  return <ContactSection context="page" />;
}