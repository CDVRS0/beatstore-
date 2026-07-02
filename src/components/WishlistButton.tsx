"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function WishlistButton({ beatId }: { beatId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session || (session.user as any)?.role !== "customer") return;
    fetch(`/api/wishlist?beatId=${beatId}`)
      .then((r) => r.json())
      .then((d) => setActive(d.wishlisted))
      .catch(() => {});
  }, [session, beatId]);

  async function toggle() {
    if (!session || (session.user as any)?.role !== "customer") {
      toast("Log in to save beats to your wishlist");
      router.push("/account/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: active ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beatId }),
      });
      if (!res.ok) throw new Error();
      setActive(!active);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-xs border px-3 py-2 text-sm transition ${
        active ? "border-blue text-blue" : "border-line text-lo hover:text-hi"
      }`}
      aria-pressed={active}
    >
      {active ? "♥ Saved" : "♡ Save"}
    </button>
  );
}
