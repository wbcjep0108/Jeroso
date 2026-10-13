import type { Metadata } from "next";
import CheckoutPageContent from "@/components/checkout/CheckoutPageContent";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
