"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";

type WishlistButtonProps = {
  wineSlug: string;
  wineName: string;
};

export default function WishlistButton({ wineSlug, wineName }: WishlistButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const { isSaved, toggleItem } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const saved = isSaved(wineSlug);

  async function toggle() {
    setFailed(false);
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setSaving(true);
    try {
      await toggleItem(wineSlug);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={authLoading || saving}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${wineName} from wishlist` : `Save ${wineName} to wishlist`}
      title={failed ? "Could not update wishlist. Please try again." : saved ? "Remove from wishlist" : "Save to wishlist"}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-line text-white/80 hover:border-sage hover:text-white disabled:cursor-wait disabled:opacity-50 motion-safe:transition-colors"
    >
      <Heart
        aria-hidden="true"
        className={`h-5 w-5 ${saved ? "fill-sage-light text-sage-light" : ""}`}
        strokeWidth={1.5}
      />
    </button>
  );
}
