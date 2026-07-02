"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast.success("You're on the list.");
      setEmail("");
    } catch {
      toast.error("Couldn't sign you up — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-lo">Stay in the loop</div>
      <p className="mt-3 text-sm text-lo">New drops, discounts, and behind-the-scenes first.</p>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full rounded-xs border border-line bg-panel px-3 py-2 text-sm text-hi placeholder:text-lo focus:border-blue"
        />
        <button
          disabled={loading}
          className="shrink-0 rounded-xs bg-blue px-3 py-2 text-sm font-bold text-hi transition hover:opacity-90 disabled:opacity-50"
        >
          Join
        </button>
      </form>
    </div>
  );
}
