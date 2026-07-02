"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CustomerRegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/customer-auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      const signInRes = await signIn("customer", { email: form.email, password: form.password, redirect: false });
      if (signInRes?.error) throw new Error("Account created — please log in");

      router.push("/account");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 md:px-8">
      <h1 className="font-display text-2xl font-bold text-hi">Create account</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xs border border-line bg-panel px-4 py-3 text-sm text-hi placeholder:text-lo focus:border-blue"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-xs border border-line bg-panel px-4 py-3 text-sm text-hi placeholder:text-lo focus:border-blue"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-xs border border-line bg-panel px-4 py-3 text-sm text-hi placeholder:text-lo focus:border-blue"
        />
        <button
          disabled={loading}
          className="w-full rounded-xs bg-blue py-3 text-sm font-bold text-hi transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-lo">
        Already have an account? <Link href="/account/login" className="text-blue hover:underline">Log in</Link>
      </p>
    </div>
  );
}
