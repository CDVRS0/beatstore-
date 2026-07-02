"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";

type AdminBeat = {
  id: string;
  slug: string;
  title: string;
  artworkUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  exclusiveSold: boolean;
  featured: boolean;
  bpm: number;
  key: string;
  genre: string;
  licenses: { price: string }[];
  _count: { orderItems: number };
};

export default function AdminBeatsPage() {
  const [beats, setBeats] = useState<AdminBeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/beats?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setBeats(data.beats || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This removes its files and cannot be undone.`)) return;
    const res = await fetch(`/api/beats/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Beat deleted");
      setBeats((b) => b.filter((x) => x.id !== id));
    } else {
      toast.error("Failed to delete");
    }
  }

  async function toggleStatus(beat: AdminBeat) {
    const status = beat.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/beats/${beat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setBeats((b) => b.map((x) => (x.id === beat.id ? { ...x, status } : x)));
    }
  }

  async function toggleExclusiveSold(beat: AdminBeat) {
    const exclusiveSold = !beat.exclusiveSold;
    const res = await fetch(`/api/beats/${beat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exclusiveSold }),
    });
    if (res.ok) {
      setBeats((b) => b.map((x) => (x.id === beat.id ? { ...x, exclusiveSold } : x)));
      toast.success(exclusiveSold ? "Marked as exclusive sold — purchasing disabled" : "Re-enabled for sale");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-hi">Beats</h1>
        <Link href="/admin/beats/new" className="rounded-xs bg-blue px-4 py-2 text-sm font-bold text-hi">
          + Upload beat
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="mb-4"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search beats…"
          className="w-full max-w-xs rounded-xs border border-line bg-panel px-3 py-2 text-sm text-hi placeholder:text-lo"
        />
      </form>

      {loading ? (
        <p className="text-sm text-lo">Loading…</p>
      ) : beats.length === 0 ? (
        <div className="rounded-xs border border-dashed border-line p-12 text-center text-lo">
          No beats yet. <Link href="/admin/beats/new" className="text-blue hover:underline">Upload your first one</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xs border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-panel text-xs uppercase tracking-wider text-lo">
              <tr>
                <th className="p-3">Beat</th>
                <th className="p-3">Status</th>
                <th className="p-3">From</th>
                <th className="p-3">Sales</th>
                <th className="p-3">Featured</th>
                <th className="p-3">Exclusive</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-panel/50">
              {beats.map((beat) => {
                const minPrice = beat.licenses.length ? Math.min(...beat.licenses.map((l) => Number(l.price))) : null;
                return (
                  <tr key={beat.id}>
                    <td className="flex items-center gap-3 p-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-xs bg-panel2">
                        {beat.artworkUrl && <Image src={beat.artworkUrl} alt="" fill className="object-cover" sizes="40px" />}
                      </div>
                      <div>
                        <div className="font-bold text-hi">{beat.title}</div>
                        <div className="text-xs text-lo">{beat.bpm} BPM · {beat.key} · {beat.genre}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleStatus(beat)}
                        className={`rounded-xs px-2 py-1 text-xs font-bold ${
                          beat.status === "PUBLISHED" ? "bg-blue/10 text-blue" : "bg-line text-lo"
                        }`}
                      >
                        {beat.status}
                      </button>
                    </td>
                    <td className="p-3 text-hi">{minPrice != null ? formatPrice(minPrice) : "—"}</td>
                    <td className="p-3 text-hi">{beat._count.orderItems}</td>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={beat.featured}
                        onChange={async (e) => {
                          const featured = e.target.checked;
                          await fetch(`/api/beats/${beat.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ featured }),
                          });
                          setBeats((b) => b.map((x) => (x.id === beat.id ? { ...x, featured } : x)));
                        }}
                        className="accent-blue"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleExclusiveSold(beat)}
                        className={`rounded-xs px-2 py-1 text-xs font-bold ${
                          beat.exclusiveSold ? "bg-red/10 text-red" : "border border-line text-lo"
                        }`}
                      >
                        {beat.exclusiveSold ? "Sold" : "Available"}
                      </button>
                    </td>
                    <td className="space-x-3 p-3 text-right">
                      <Link href={`/admin/beats/${beat.id}/edit`} className="text-xs text-blue hover:underline">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(beat.id, beat.title)} className="text-xs text-red hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
