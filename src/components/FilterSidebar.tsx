"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GENRE_OPTIONS, MOOD_OPTIONS, KEY_OPTIONS } from "@/lib/utils";

export default function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  function toggleMulti(key: string, value: string) {
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateParam(key, next.length ? next.join(",") : null);
  }

  const activeGenres = params.get("genre")?.split(",").filter(Boolean) ?? [];
  const activeMoods = params.get("mood")?.split(",").filter(Boolean) ?? [];

  return (
    <aside className="w-full shrink-0 space-y-6 md:w-56">
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-lo">Genre</h3>
        <div className="flex flex-wrap gap-1.5">
          {GENRE_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => toggleMulti("genre", g)}
              className={`rounded-xs border px-2 py-1 text-xs transition ${
                activeGenres.includes(g) ? "border-blue bg-blue/10 text-blue" : "border-line text-lo hover:text-hi"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-lo">Mood</h3>
        <div className="flex flex-wrap gap-1.5">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => toggleMulti("mood", m)}
              className={`rounded-xs border px-2 py-1 text-xs transition ${
                activeMoods.includes(m) ? "border-blue bg-blue/10 text-blue" : "border-line text-lo hover:text-hi"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-lo">BPM range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={params.get("bpmMin") ?? ""}
            onBlur={(e) => updateParam("bpmMin", e.target.value || null)}
            className="w-full rounded-xs border border-line bg-panel px-2 py-1.5 text-xs text-hi placeholder:text-lo"
          />
          <span className="text-lo">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={params.get("bpmMax") ?? ""}
            onBlur={(e) => updateParam("bpmMax", e.target.value || null)}
            className="w-full rounded-xs border border-line bg-panel px-2 py-1.5 text-xs text-hi placeholder:text-lo"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-lo">Key</h3>
        <select
          defaultValue={params.get("key") ?? ""}
          onChange={(e) => updateParam("key", e.target.value || null)}
          className="w-full rounded-xs border border-line bg-panel px-2 py-1.5 text-xs text-hi"
        >
          <option value="">Any key</option>
          {KEY_OPTIONS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <button onClick={() => router.push(pathname)} className="text-xs text-lo underline hover:text-hi">
        Clear all filters
      </button>
    </aside>
  );
}
