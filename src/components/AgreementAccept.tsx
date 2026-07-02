"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/context/CartContext";
import toast from "react-hot-toast";

export default function AgreementAccept({
  beat,
  license,
}: {
  beat: { id: string; title: string; slug: string; artworkUrl: string | null };
  license: { id: string; name: string; price: number };
}) {
  const [checked, setChecked] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  function handleContinue() {
    if (!checked) return;
    addItem({
      beatId: beat.id,
      beatTitle: beat.title,
      beatSlug: beat.slug,
      artworkUrl: beat.artworkUrl,
      licenseId: license.id,
      licenseName: license.name,
      price: license.price,
      agreementAccepted: true,
    });
    toast.success(`${license.name} added to cart`);
    router.push("/cart");
  }

  return (
    <div className="mt-8 rounded-xs border border-line bg-panel p-5">
      <label className="flex items-start gap-3 text-sm text-hi">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-blue"
        />
        <span>
          I have read and agree to the licensing terms above for <strong>{license.name}</strong> on{" "}
          <strong>{beat.title}</strong>.
        </span>
      </label>
      <button
        onClick={handleContinue}
        disabled={!checked}
        className="mt-4 w-full rounded-xs bg-blue py-3 text-sm font-bold text-hi transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add to cart & continue
      </button>
    </div>
  );
}
