"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AddToCartButton from "@/components/wines/AddToCartButton";

type PurchasePanelProps = {
  wineName: string;
  maxQuantity?: number;
};

/** Quantity stepper next to the Add to Cart button. */
export default function PurchasePanel({ wineName, maxQuantity = 12 }: PurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);

  const stepperButton =
    "flex h-12 w-12 items-center justify-center text-white/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        role="group"
        aria-label="Quantity"
        className="flex items-center rounded-full border border-ink-line"
      >
        <button
          type="button"
          className={stepperButton}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus aria-hidden="true" className="h-4 w-4" />
        </button>
        <output aria-live="polite" className="w-8 text-center tabular-nums">
          {quantity}
        </output>
        <button
          type="button"
          className={stepperButton}
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          disabled={quantity >= maxQuantity}
          aria-label="Increase quantity"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <AddToCartButton wineName={wineName} quantity={quantity} />
    </div>
  );
}
