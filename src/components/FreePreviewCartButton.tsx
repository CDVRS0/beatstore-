"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCartStore } from "@/context/CartContext";

export default function FreePreviewCartButton({
  beatId,
  beatTitle,
  beatSlug,
  artworkUrl,
}: {
  beatId: string;
  beatTitle: string;
  beatSlug: string;
  artworkUrl: string | null;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem({
      beatId,
      beatTitle,
      beatSlug,
      artworkUrl,
      licenseId: `free-preview:${beatId}`,
      licenseName: "Tagged preview",
      price: 0,
      agreementAccepted: true,
    });
    toast.success("Tagged preview added to cart");
    router.push("/cart");
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="rounded-xs bg-blue px-4 py-3 text-sm font-bold text-hi transition hover:opacity-90"
    >
      Add tagged preview to cart
    </button>
  );
}
