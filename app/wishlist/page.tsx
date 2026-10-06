import type { Metadata } from "next";
import WishlistPageContent from "@/components/wines/WishlistPageContent";
import { getAllWines } from "@/lib/wines";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const wines = await getAllWines();
  return <WishlistPageContent wines={wines} />;
}
