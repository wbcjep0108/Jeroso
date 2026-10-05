"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import type { Wine } from "@/lib/wines";

type AddToCartButtonProps = {
  wine: Pick<Wine, "slug" | "name" | "price" | "image">;
  quantity?: number;
  size?: "sm" | "md";
  className?: string;
  /** -1 for duplicated carousel slides that must not be tab stops. */
  tabIndex?: number;
  variant?: "solid" | "outline";
};

/**
 * PLACEHOLDER: there is no cart backend yet. Clicking gives visible feedback
 * ("Cart coming soon") instead of silently doing nothing. Replace handleClick
 * with a real cart action when one exists.
 */
export default function AddToCartButton({
  wine,
  quantity = 1,
  size = "md",
  className = "",
  tabIndex,
  variant = "solid",
}: AddToCartButtonProps) {
  const [notice, setNotice] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleClick() {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/cart")}`);
      return;
    }

    setSaving(true);
    setError(false);
    try {
      await addItem(wine, quantity);
      setNotice(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setNotice(false), 2500);
    } catch {
      setError(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setError(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const sizing = size === "sm" ? "h-9 px-4 text-xs" : "h-12 px-6 text-sm";
  // "solid": white pill with bag icon (cards). "outline": rounded box, no icon (detail page).
  const look =
    variant === "outline"
      ? "rounded-xl border border-white/15 bg-white/[0.03] text-white hover:border-sage-light/60 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-light"
      : "rounded-full bg-white font-medium text-ink hover:bg-sage-light";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        tabIndex={tabIndex}
        aria-label={`Add ${quantity} ${wine.name} to cart`}
        title={user ? "Add to cart" : "Sign in to add to cart"}
        disabled={saving || authLoading}
        className={`inline-flex items-center justify-center gap-2 motion-safe:transition-colors ${look} ${sizing} ${className}`}
      >
        {variant === "solid" && <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />}
        {saving ? "Adding…" : error ? "Try Again" : notice ? "Added to Cart" : "Add to Cart"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {notice ? `${wine.name} added to your cart.` : error ? "Could not add this item. Check your connection and try again." : ""}
      </span>
    </>
  );
}
