"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AddToCartButton from "@/components/wines/AddToCartButton";
import type { Wine } from "@/lib/wines";

type PurchasePanelProps = {
  wine: Pick<Wine, "slug" | "name" | "price" | "image">;
  maxQuantity?: number;
};

/** Quantity stepper next to a wide outlined Add to Cart button, both in matching rounded boxes. */
export default function PurchasePanel({ wine, maxQuantity = 12 }: PurchasePanelProps) {
  const [quantity, setQuantity] = useState("1");
  const numericQuantity = Math.min(maxQuantity, Math.max(1, Number(quantity) || 1));

  const stepperButton =
    "flex h-10 w-10 items-center justify-center rounded-lg text-sage hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-light disabled:cursor-not-allowed disabled:opacity-30 motion-safe:transition-colors";

  return (
    <div className="flex w-full items-stretch gap-3">
      <div
        role="group"
        aria-label="Quantity"
        className="flex h-12 w-32 shrink-0 items-center justify-between rounded-xl border border-white/15 bg-white/[0.03] px-1"
      >
        <button
          type="button"
          className={stepperButton}
          onClick={() => setQuantity(String(Math.max(1, numericQuantity - 1)))}
          disabled={numericQuantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <input
          type="number"
          min={1}
          max={maxQuantity}
          inputMode="numeric"
          value={quantity}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "" || /^\d+$/.test(value)) setQuantity(value);
          }}
          onBlur={() => setQuantity(String(numericQuantity))}
          aria-label="Quantity"
          className="w-10 appearance-none bg-transparent text-center text-sm tabular-nums text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          className={stepperButton}
          onClick={() => setQuantity(String(Math.min(maxQuantity, numericQuantity + 1)))}
          disabled={numericQuantity >= maxQuantity}
          aria-label="Increase quantity"
        >
          <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <AddToCartButton wine={wine} quantity={numericQuantity} variant="outline" className="min-w-0 flex-1" />
    </div>
  );
}
