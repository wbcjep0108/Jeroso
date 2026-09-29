import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <ComingSoon
      title="Contact"
      description="A contact form and store details are coming. Until then, browse the collection."
    />
  );
}
