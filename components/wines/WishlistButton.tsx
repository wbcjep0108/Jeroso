"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

type WishlistButtonProps = {
  wineName: string;
};

/**
 * PLACEHOLDER: toggles for this visit only. Nothing is persisted until a
 * wishlist backend exists; wire the toggle to it here.
 */
export default function WishlistButton({ wineName }: WishlistButtonProps) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setSaved((s) => !s)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${wineName} from wishlist` : `Save ${wineName} to wishlist`}
      title="Wishlist is saved for this visit only (coming soon)"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-line text-white/80 hover:border-sage hover:text-white motion-safe:transition-colors"
    >
      <Heart
        aria-hidden="true"
        className={`h-5 w-5 ${saved ? "fill-sage-light text-sage-light" : ""}`}
        strokeWidth={1.5}
      />
    </button>
  );
}
