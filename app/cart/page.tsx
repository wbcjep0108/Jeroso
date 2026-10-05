import type { Metadata } from "next";
import CartPageContent from "@/components/cart/CartPageContent";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return <CartPageContent />;
}
