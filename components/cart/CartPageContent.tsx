"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import Container from "@/components/layout/Container";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/wines";
import { useState } from "react";

function CartContent() {
  const { items, loading, updateQuantity, removeItem } = useCart();
  const [error, setError] = useState("");
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  async function changeQuantity(slug: string, quantity: number) {
    setError("");
    try {
      await updateQuantity(slug, quantity);
    } catch {
      setError("We could not update your cart. Please try again.");
    }
  }

  async function remove(slug: string) {
    setError("");
    try {
      await removeItem(slug);
    } catch {
      setError("We could not remove that item. Please try again.");
    }
  }

  return (
    <Container className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-[0.24em] text-sage">Your selection</p>
        <h1 className="mt-4 font-serif text-5xl italic sm:text-6xl">Cart</h1>
        <p className="mt-4 text-sm text-white/60">{itemCount ? `${itemCount} bottle${itemCount === 1 ? "" : "s"} selected.` : "Your cart is waiting for a good bottle."}</p>

        {error && <p role="alert" className="mt-8 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        {loading ? (
          <div className="mt-12 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-sage-light" aria-label="Loading cart" /></div>
        ) : items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center sm:p-12">
            <p className="font-serif text-3xl italic">Nothing here yet.</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">Explore the collection and add a bottle when you find one that belongs at your table.</p>
            <Link href="/wines" className="mt-8 inline-flex h-12 items-center rounded-xl bg-white px-6 text-sm font-medium text-ink hover:bg-sage-light">Browse wines</Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_20rem]">
            <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.035] px-5 sm:px-7">
              {items.map((item) => (
                <article key={item.slug} className="flex gap-4 py-6 sm:gap-6">
                  <Link href={`/wines/${item.slug}`} className="flex h-28 w-20 shrink-0 items-center justify-center rounded-xl bg-ink-soft p-2 sm:h-32 sm:w-24">
                    <Image src={item.image} alt={`Bottle of ${item.name}`} width={100} height={240} className="h-full w-auto" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/wines/${item.slug}`} className="font-serif text-2xl italic hover:text-sage-light">{item.name}</Link>
                    <p className="mt-1 text-sm text-white/60">{formatPrice(item.price)} each</p>
                    <div className="mt-5 flex items-center gap-4">
                      <div className="flex h-10 items-center rounded-lg border border-white/15 bg-white/[0.03]">
                        <button type="button" onClick={() => void changeQuantity(item.slug, item.quantity - 1)} disabled={item.quantity <= 1} className="flex h-9 w-9 items-center justify-center text-sage hover:text-white disabled:opacity-30" aria-label={`Decrease ${item.name} quantity`}><Minus size={15} /></button>
                        <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button type="button" onClick={() => void changeQuantity(item.slug, item.quantity + 1)} disabled={item.quantity >= 12} className="flex h-9 w-9 items-center justify-center text-sage hover:text-white disabled:opacity-30" aria-label={`Increase ${item.name} quantity`}><Plus size={15} /></button>
                      </div>
                    </div>
                    <button type="button" onClick={() => void remove(item.slug)} className="mt-4 inline-flex items-center gap-2 text-xs text-white/45 hover:text-white sm:hidden" aria-label={`Remove ${item.name} from cart`}><Trash2 size={14} /> Remove</button>
                  </div>
                  <p className="hidden font-serif text-xl sm:block">{formatPrice(item.price * item.quantity)}</p>
                  <button type="button" onClick={() => void remove(item.slug)} className="hidden shrink-0 self-end pb-1 text-xs text-white/45 hover:text-white sm:inline-flex sm:items-center sm:gap-2" aria-label={`Remove ${item.name} from cart`}><Trash2 size={14} /> Remove</button>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-7">
              <h2 className="font-serif text-3xl italic">Summary</h2>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5"><span className="text-sm text-white/60">Subtotal</span><span className="font-serif text-2xl">{formatPrice(total)}</span></div>
              <button type="button" disabled className="mt-6 h-12 w-full rounded-xl bg-white/20 text-sm text-white/50">Checkout coming soon</button>
              <p className="mt-4 text-center text-xs leading-relaxed text-white/40">Orders and delivery will be available soon.</p>
            </aside>
          </div>
        )}
      </div>
    </Container>
  );
}

export default function CartPageContent() {
  return <AuthGuard><CartContent /></AuthGuard>;
}
