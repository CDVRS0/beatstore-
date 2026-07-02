"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Template = {
  id: string;
  name: string;
  description: string | null;
  defaultPrice: string;
  fileFormats: string[];
  streamLimit: number | null;
  distributionLimit: number | null;
  musicVideos: boolean;
  performanceRights: boolean;
  commercialUse: boolean;
  isExclusive: boolean;
  agreementText: string;
  sortOrder: number;
};

const EMPTY: Omit<Template, "id"> = {
  name: "",
  description: "",
  defaultPrice: "29.99",
  fileFormats: ["MP3"],
  streamLimit: 100000,
  distributionLimit: 2000,
  musicVideos: false,
  performanceRights: false,
  commercialUse: true,
  isExclusive: false,
  agreementText: "",
  sortOrder: 0,
};

export default function AdminLicensesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Template | (Omit<Template, "id"> & { id?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/license-templates");
    const data = await res.json();
    setTemplates(data.templates || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!editing || !editing.name) return toast.error("Name is required");
    const isNew = !("id" in editing) || !editing.id;
    const url = isNew ? "/api/license-templates" : `/api/license-templates/${(editing as Template).id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editing, defaultPrice: parseFloat(editing.defaultPrice as any) }),
    });
    if (res.ok) {
      toast.success("Saved");
      setEditing(null);
      load();
    } else {
      toast.error("Failed to save");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this license type? Beats already using it keep their existing license.")) return;
    const res = await fetch(`/api/license-templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      load();
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-hi">License types</h1>
        <button onClick={() => setEditing({ ...EMPTY })} className="rounded-xs bg-blue px-4 py-2 text-sm font-bold text-hi">
          + New license type
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-lo">Loading…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xs border border-line bg-panel p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-hi">{t.name}</h3>
                <span className="text-sm text-hi">£{t.defaultPrice}</span>
              </div>
              <p className="mt-1 text-xs text-lo">{t.description}</p>
              <div className="mt-3 flex gap-3 text-xs">
                <button onClick={() => setEditing(t)} className="text-blue hover:underline">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="text-red hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xs border border-line bg-panel p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-hi">
              {"id" in editing && editing.id ? "Edit license type" : "New license type"}
            </h2>
            <div className="space-y-3">
              <LabeledInput label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <LabeledInput label="Description" value={editing.description || ""} onChange={(v) => setEditing({ ...editing, description: v })} />
              <LabeledInput label="Default price (£)" value={String(editing.defaultPrice)} onChange={(v) => setEditing({ ...editing, defaultPrice: v as any })} />
              <LabeledInput
                label="File formats (comma separated: MP3, WAV, STEMS)"
                value={editing.fileFormats.join(", ")}
                onChange={(v) => setEditing({ ...editing, fileFormats: v.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean) })}
              />
              <div className="grid grid-cols-2 gap-3">
                <LabeledInput
                  label="Stream limit (blank = unlimited)"
                  value={editing.streamLimit?.toString() || ""}
                  onChange={(v) => setEditing({ ...editing, streamLimit: v ? parseInt(v) : null })}
                />
                <LabeledInput
                  label="Distribution/sales limit"
                  value={editing.distributionLimit?.toString() || ""}
                  onChange={(v) => setEditing({ ...editing, distributionLimit: v ? parseInt(v) : null })}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-hi">
                <Checkbox label="Music videos" checked={editing.musicVideos} onChange={(v) => setEditing({ ...editing, musicVideos: v })} />
                <Checkbox label="Performance rights" checked={editing.performanceRights} onChange={(v) => setEditing({ ...editing, performanceRights: v })} />
                <Checkbox label="Commercial use" checked={editing.commercialUse} onChange={(v) => setEditing({ ...editing, commercialUse: v })} />
                <Checkbox label="Exclusive rights" checked={editing.isExclusive} onChange={(v) => setEditing({ ...editing, isExclusive: v })} />
              </div>
              <label className="block">
                <span className="mb-1 block text-xs text-lo">Agreement text</span>
                <textarea
                  rows={6}
                  value={editing.agreementText}
                  onChange={(e) => setEditing({ ...editing, agreementText: e.target.value })}
                  className="w-full rounded-xs border border-line bg-void px-3 py-2 text-sm text-hi"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="rounded-xs border border-line px-4 py-2 text-sm text-lo">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-xs bg-blue px-4 py-2 text-sm font-bold text-hi">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-lo">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xs border border-line bg-void px-3 py-2 text-sm text-hi" />
    </label>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-blue" />
      {label}
    </label>
  );
}
