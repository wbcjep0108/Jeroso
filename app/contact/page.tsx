import type { Metadata } from "next";
import ContactSection from "@/components/sections/ContactSection";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Jeroso about a wine or a private tasting.",
};

export default function ContactPage() {
  return <ContactSection context="page" />;
}
