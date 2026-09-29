import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <ComingSoon
      title="Wishlist"
      description="Saved wines will live here once accounts are available."
    />
  );
}
