"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AddToCartButton from "@/components/wines/AddToCartButton";

type PurchasePanelProps = {
  wineName: string;
  maxQuantity?: number;
};

/** Quantity stepper next to a wide outlined Add to Cart button, both in matching rounded boxes. */
export default function PurchasePanel({ wineName, maxQuantity = 12 }: PurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);

  const stepperButton =
    "flex h-10 w-10 items-center justify-center rounded-lg text-sage hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-light disabled:cursor-not-allowed disabled:opacity-30 motion-safe:transition-colors";

  return (
    <div className="flex w-full max-w-md items-stretch gap-2">
      <div
        role="group"
        aria-label="Quantity"
        className="flex h-12 shrink-0 items-center rounded-xl border border-white/15 bg-white/[0.03] px-1"
      >
        <button
          type="button"
          className={stepperButton}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
        </button>
        {/* Shown as 01, 02...; screen readers get the plain number. */}
        <output aria-live="polite" aria-label={`Quantity ${quantity}`} className="w-8 text-center text-sm tabular-nums text-white">
          {String(quantity).padStart(2, "0")}
        </output>
        <button
          type="button"
          className={stepperButton}
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          disabled={quantity >= maxQuantity}
          aria-label="Increase quantity"
        >
          <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <AddToCartButton wineName={wineName} quantity={quantity} variant="outline" className="flex-1" />
    </div>
  );
}
