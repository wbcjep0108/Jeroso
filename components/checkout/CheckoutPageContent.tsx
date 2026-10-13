"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Container from "@/components/layout/Container";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, type CheckoutDetails } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/wines";

const fieldClass = "mt-2 block w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/30 focus-visible:border-sage-light focus-visible:outline-none motion-safe:transition-colors";
const labelClass = "text-sm text-white/70";

const initialDetails: CheckoutDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};

function CheckoutContent() {
  const fieldId = useId();
  const { user } = useAuth();
  const { items, loading, checkout } = useCart();
  const [details, setDetails] = useState<CheckoutDetails>({ ...initialDetails, email: user?.email ?? "" });
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  function updateField(field: keyof CheckoutDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  async function sendConfirmationEmail(orderId: string, orderItems: { slug: string; quantity: number }[], orderDetails: CheckoutDetails) {
    const response = await fetch("/api/orders/confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        firstName: orderDetails.firstName,
        email: orderDetails.email,
        items: orderItems,
      }),
    });
    if (!response.ok) throw new Error("Your order was saved, but we could not send its confirmation email.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedDetails = Object.fromEntries(
      Object.entries(details).map(([field, value]) => [field, value.trim()]),
    ) as CheckoutDetails;

    if (Object.values(normalizedDetails).some((value) => !value)) {
      setStatus("error");
      setMessage("Please complete every delivery field.");
      return;
    }

    if (!ageConfirmed) {
      setStatus("error");
      setMessage("Please confirm that you are at least 18 years old.");
      return;
    }

    setStatus("submitting");
    setMessage("");
    try {
      const orderItems = items.map(({ slug, quantity }) => ({ slug, quantity }));
      const orderId = await checkout(normalizedDetails);
      setStatus("success");
      try {
        await sendConfirmationEmail(orderId, orderItems, normalizedDetails);
        setMessage(`Order request submitted. A processing confirmation has been sent to ${normalizedDetails.email}. Reference: ${orderId.slice(0, 8).toUpperCase()}.`);
      } catch (emailError) {
        setMessage(emailError instanceof Error ? `${emailError.message} Reference: ${orderId.slice(0, 8).toUpperCase()}.` : `Order request submitted. Reference: ${orderId.slice(0, 8).toUpperCase()}.`);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We could not submit your order. Please try again.");
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center px-6"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-sage-light" aria-label="Loading checkout" /></div>;
  }

  if (status === "success") {
    return (
      <Container className="py-24 sm:py-32">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center sm:p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-sage">Order received</p>
          <h1 className="mt-4 font-serif text-5xl italic">Thank you.</h1>
          <p role="status" className="mt-5 text-sm leading-relaxed text-white/65">{message}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/45">We will confirm availability and payment details using the email you provided.</p>
          <Link href="/wines" className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-medium text-ink hover:bg-sage-light motion-safe:transition-colors">Continue browsing</Link>
        </div>
      </Container>
    );
  }

  if (!items.length) {
    return (
      <Container className="py-24 sm:py-32">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center sm:p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-sage">Checkout</p>
          <h1 className="mt-4 font-serif text-5xl italic">Your cart is empty.</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">Choose a bottle from the collection before checking out.</p>
          <Link href="/wines" className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-medium text-ink hover:bg-sage-light motion-safe:transition-colors">Browse wines</Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.24em] text-sage">Checkout</p>
        <h1 className="mt-4 font-serif text-5xl italic sm:text-6xl">Complete your order</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">Submit your delivery details and we’ll confirm availability and payment before fulfilling your order.</p>

        <form onSubmit={(event) => void submit(event)} className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8" aria-labelledby={`${fieldId}-delivery`}>
            <h2 id={`${fieldId}-delivery`} className="font-serif text-3xl italic">Delivery details</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>First name<input required aria-required="true" autoComplete="given-name" value={details.firstName} onChange={(event) => updateField("firstName", event.target.value)} className={fieldClass} /></label>
              <label className={labelClass}>Last name<input required aria-required="true" autoComplete="family-name" value={details.lastName} onChange={(event) => updateField("lastName", event.target.value)} className={fieldClass} /></label>
              <label className={labelClass}>Email<input required aria-required="true" type="email" autoComplete="email" value={details.email} onChange={(event) => updateField("email", event.target.value)} className={fieldClass} /></label>
              <label className={labelClass}>Phone<input required aria-required="true" type="tel" autoComplete="tel" value={details.phone} onChange={(event) => updateField("phone", event.target.value)} className={fieldClass} /></label>
              <label className={`${labelClass} sm:col-span-2`}>Address<input required aria-required="true" autoComplete="street-address" value={details.address} onChange={(event) => updateField("address", event.target.value)} className={fieldClass} /></label>
              <label className={labelClass}>City / municipality<input required aria-required="true" autoComplete="address-level2" value={details.city} onChange={(event) => updateField("city", event.target.value)} className={fieldClass} /></label>
              <label className={labelClass}>Postal code<input required aria-required="true" autoComplete="postal-code" value={details.postalCode} onChange={(event) => updateField("postalCode", event.target.value)} className={fieldClass} /></label>
            </div>
            <label className="mt-7 flex items-start gap-3 text-sm leading-relaxed text-white/65">
              <input required aria-required="true" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} type="checkbox" className="mt-1 h-4 w-4 accent-[#bac5ba]" />
              <span>I confirm that I am at least 18 years old and may purchase alcohol in my area.</span>
            </label>
          </section>

          <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-7" aria-labelledby={`${fieldId}-summary`}>
            <h2 id={`${fieldId}-summary`} className="font-serif text-3xl italic">Order summary</h2>
            <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-3 py-4">
                  <div className="relative h-16 w-12 shrink-0 rounded-lg bg-ink-soft p-1"><Image src={item.image} alt="" fill sizes="48px" className="object-contain" /></div>
                  <div className="min-w-0 flex-1"><p className="font-serif text-lg italic leading-tight">{item.name}</p><p className="mt-1 text-xs text-white/50">{item.quantity} × {formatPrice(item.price)}</p></div>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between"><span className="text-sm text-white/60">{itemCount} bottle{itemCount === 1 ? "" : "s"}</span><span className="font-serif text-2xl">{formatPrice(total)}</span></div>
            {status === "error" && <p role="alert" className="mt-4 text-sm text-red-200">{message}</p>}
            <button type="submit" disabled={status === "submitting"} className="mt-6 h-12 w-full rounded-xl bg-white text-sm font-medium text-ink hover:bg-sage-light disabled:cursor-wait disabled:opacity-60 motion-safe:transition-colors">{status === "submitting" ? "Submitting…" : "Submit order request"}</button>
            <p className="mt-4 text-center text-xs leading-relaxed text-white/45">No payment is captured here. We’ll contact you to confirm payment and delivery.</p>
            <Link href="/cart" className="mt-4 block text-center text-xs text-white/55 hover:text-white">Return to cart</Link>
          </aside>
        </form>
      </div>
    </Container>
  );
}

export default function CheckoutPageContent() {
  return <AuthGuard><CheckoutContent /></AuthGuard>;
}
