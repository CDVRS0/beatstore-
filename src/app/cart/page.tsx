"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, removeItem, total } = useCartStore();
  const { data: session } = useSession();
  const [email, setEmail] = useState(session?.user?.email || "");
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!email) {
      toast.error("Enter your email to receive the receipt and downloads");
      return;
    }
    if (items.some((i) => !i.agreementAccepted)) {
      toast.error("One or more items are missing an accepted license agreement");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map((i) => ({ beatId: i.beatId, licenseId: i.licenseId })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
        <h1 className="font-display text-2xl font-bold text-hi">Your cart is empty</h1>
        <p className="mt-2 text-sm text-lo">Find something that fits your sound.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-xs bg-blue px-5 py-3 text-sm font-bold text-hi">
          Browse beats
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-hi">Your cart</h1>

      <div className="divide-y divide-line rounded-xs border border-line bg-panel">
        {items.map((item) => (
          <div key={`${item.beatId}-${item.licenseId}`} className="flex items-center gap-4 p-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xs bg-panel2">
              {item.artworkUrl && <Image src={item.artworkUrl} alt="" fill className="object-cover" sizes="56px" />}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/beats/${item.beatSlug}`} className="truncate font-bold text-hi hover:text-blue">
                {item.beatTitle}
              </Link>
              <div className="text-xs text-lo">{item.licenseName}</div>
            </div>
            <div className="text-sm font-bold text-hi">{formatPrice(item.price)}</div>
            <button
              onClick={() => removeItem(item.beatId, item.licenseId)}
              className="text-xs text-lo hover:text-red"
              aria-label={`Remove ${item.beatTitle}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-lg font-bold text-hi">
        <span>Total</span>
        <span>{formatPrice(total())}</span>
      </div>

      <div className="mt-6">
        <label className="mb-1 block text-xs text-lo">Email (for receipt & downloads)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full rounded-xs border border-line bg-panel px-4 py-3 text-sm text-hi placeholder:text-lo focus:border-blue"
        />
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-4 w-full rounded-xs bg-blue py-3.5 text-sm font-bold text-hi transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Redirecting to payment…" : "Proceed to checkout"}
      </button>
      <p className="mt-3 text-center text-[11px] text-lo">Secure payment via Stripe. You'll be redirected to complete payment.</p>
    </div>
  );
}
