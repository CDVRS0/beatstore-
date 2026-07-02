"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Message sent — I'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Couldn't send that — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 md:px-8">
      <h1 className="font-display text-3xl font-bold text-hi">Contact</h1>
      <p className="mt-2 text-sm text-lo">
        Questions about a license, a custom beat, or something else? Send a message.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-xs text-lo">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xs border border-line bg-panel px-4 py-3 text-sm text-hi focus:border-blue"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-lo">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xs border border-line bg-panel px-4 py-3 text-sm text-hi focus:border-blue"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-lo">Message</label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-xs border border-line bg-panel px-4 py-3 text-sm text-hi focus:border-blue"
          />
        </div>
        <button
          disabled={loading}
          className="w-full rounded-xs bg-blue py-3 text-sm font-bold text-hi transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
