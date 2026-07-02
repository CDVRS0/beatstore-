"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("customer", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Incorrect email or password");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 md:px-8">
      <h1 className="font-display text-2xl font-bold text-hi">Log in</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xs border border-line bg-panel px-4 py-3 text-sm text-hi placeholder:text-lo focus:border-blue"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xs border border-line bg-panel px-4 py-3 text-sm text-hi placeholder:text-lo focus:border-blue"
        />
        <button
          disabled={loading}
          className="w-full rounded-xs bg-blue py-3 text-sm font-bold text-hi transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-lo">
        No account yet? <Link href="/account/register" className="text-blue hover:underline">Create one</Link>
      </p>
    </div>
  );
}
