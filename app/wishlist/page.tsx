import type { Metadata } from "next";
import AuthGuard from "@/components/auth/AuthGuard";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return <AuthGuard><ComingSoon title="Wishlist" description="Your saved wines will live here." /></AuthGuard>;
}
