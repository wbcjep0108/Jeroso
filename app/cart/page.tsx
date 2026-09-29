import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <ComingSoon
      title="Cart"
      description="Checkout is not available yet. Your cart will appear here once it is."
    />
  );
}
