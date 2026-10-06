"use client";

import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import Container from "@/components/layout/Container";
import WineCard from "@/components/wines/WineCard";
import WishlistButton from "@/components/wines/WishlistButton";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Wine } from "@/lib/wines";

function WishlistContent({ wines }: { wines: Wine[] }) {
  const { slugs, loading } = useWishlist();
  const saved = new Set(slugs);
  const wishlistWines = wines.filter((wine) => saved.has(wine.slug));

  return (
    <Container className="py-16 sm:py-24">
      <p className="text-xs uppercase tracking-[0.24em] text-sage">Your selection</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl italic sm:text-6xl">Wishlist</h1>
          <p className="mt-4 text-sm text-white/60">
            {wishlistWines.length
              ? `${wishlistWines.length} saved wine${wishlistWines.length === 1 ? "" : "s"}.`
              : "Keep the bottles you want to return to in one place."}
          </p>
        </div>
        {wishlistWines.length > 0 && (
          <Link href="/wines" className="text-sm text-white/65 hover:text-white">
            Continue browsing
          </Link>
        )}
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-sage-light" aria-label="Loading wishlist" />
        </div>
      ) : wishlistWines.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center sm:p-12">
          <p className="font-serif text-3xl italic">No saved wines yet.</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">
            Open a wine and tap the heart to save it here for later.
          </p>
          <Link href="/wines" className="mt-8 inline-flex h-12 items-center rounded-xl bg-white px-6 text-sm font-medium text-ink hover:bg-sage-light">
            Explore wines
          </Link>
        </div>
      ) : (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistWines.map((wine) => (
            <li key={wine.slug} className="relative">
              <WineCard wine={wine} />
              <div className="absolute right-4 top-4 z-20 [&>button]:border-white/15 [&>button]:bg-ink/80 [&>button]:backdrop-blur-md">
                <WishlistButton wineSlug={wine.slug} wineName={wine.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

export default function WishlistPageContent({ wines }: { wines: Wine[] }) {
  return (
    <AuthGuard>
      <WishlistContent wines={wines} />
    </AuthGuard>
  );
}
