"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";

type AddToCartButtonProps = {
  wineName: string;
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
  wineName,
  quantity = 1,
  size = "md",
  className = "",
  tabIndex,
  variant = "solid",
}: AddToCartButtonProps) {
  const [notice, setNotice] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleClick() {
    setNotice(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(false), 2500);
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
        aria-label={`Add ${quantity} ${wineName} to cart (cart coming soon)`}
        title="Cart coming soon"
        className={`inline-flex items-center justify-center gap-2 motion-safe:transition-colors ${look} ${sizing} ${className}`}
      >
        {variant === "solid" && <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />}
        {notice ? "Cart coming soon" : "Add to Cart"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {notice ? "Cart is not available yet. Coming soon." : ""}
      </span>
    </>
  );
}
