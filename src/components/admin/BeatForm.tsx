"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GENRE_OPTIONS, MOOD_OPTIONS, KEY_OPTIONS } from "@/lib/utils";
import { uploadToR2 } from "@/lib/upload-client";

type LicenseTemplate = {
  id: string;
  name: string;
  defaultPrice: string;
  isExclusive: boolean;
};

type ExistingFile = { id: string; kind: string; fileName: string };

type ExistingBeat = {
  id: string;
  title: string;
  description: string | null;
  bpm: number;
  key: string;
  genre: string;
  mood: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  artworkUrl: string | null;
  licenses: { id: string; templateId: string; price: string }[];
  files: ExistingFile[];
};

export default function BeatForm({
  templates,
  existing,
}: {
  templates: LicenseTemplate[];
  existing?: ExistingBeat;
}) {
  const router = useRouter();
  const isEdit = !!existing;
  const tempId = existing?.id || `new-${Date.now()}`;

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [bpm, setBpm] = useState(existing?.bpm?.toString() || "140");
  const [key, setKey] = useState(existing?.key || KEY_OPTIONS[0]);
  const [genre, setGenre] = useState(existing?.genre || GENRE_OPTIONS[0]);
  const [mood, setMood] = useState(existing?.mood || MOOD_OPTIONS[0]);
  const [tags, setTags] = useState(existing?.tags?.join(", ") || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(existing?.status || "DRAFT");
  const [featured, setFeatured] = useState(existing?.featured || false);

  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [pendingFiles, setPendingFiles] = useState<{ file: File; kind: string }[]>([]);
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>(existing?.files || []);

  const initialSelection: Record<string, { selected: boolean; price: string }> = {};
  templates.forEach((t) => {
    const match = existing?.licenses.find((l) => l.templateId === t.id);
    initialSelection[t.id] = { selected: !!match || !isEdit, price: match?.price ?? t.defaultPrice };
  });
  const [selection, setSelection] = useState(initialSelection);

  const [saving, setSaving] = useState(false);

  function addPendingFile(kind: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setPendingFiles((p) => [...p, { file, kind }]);
    };
  }

  async function handleDeleteExistingFile(fileId: string) {
    if (!existing) return;
    const res = await fetch(`/api/beats/${existing.id}/files`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });
    if (res.ok) {
      setExistingFiles((f) => f.filter((x) => x.id !== fileId));
      toast.success("File removed");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");

    setSaving(true);
    try {
      let artworkKey: string | undefined;
      let previewKey: string | undefined;

      if (artworkFile) artworkKey = await uploadToR2({ file: artworkFile, beatId: tempId, folder: "artwork" });
      if (previewFile) previewKey = await uploadToR2({ file: previewFile, beatId: tempId, folder: "preview" });

      const selectedTemplateIds = Object.entries(selection)
        .filter(([, v]) => v.selected)
        .map(([id]) => id);

      const priceOverrides = Object.fromEntries(
        Object.entries(selection).map(([id, v]) => [id, parseFloat(v.price)])
      );

      let beatId = existing?.id;

      if (isEdit) {
        await fetch(`/api/beats/${existing!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            bpm: parseInt(bpm),
            key,
            genre,
            mood,
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            status,
            featured,
            ...(artworkKey && { artworkKey }),
            ...(previewKey && { previewKey }),
            licenses: selectedTemplateIds.map((id) => ({
              id: existing!.licenses.find((l) => l.templateId === id)?.id,
              price: parseFloat(selection[id].price),
            })).filter((l) => l.id),
          }),
        });
      } else {
        if (selectedTemplateIds.length === 0) {
          toast.error("Select at least one license type");
          setSaving(false);
          return;
        }
        const res = await fetch("/api/beats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            bpm: parseInt(bpm),
            key,
            genre,
            mood,
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            status,
            featured,
            artworkKey,
            previewKey,
            licenseTemplateIds: selectedTemplateIds,
            priceOverrides,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to create beat");
        beatId = data.beat.id;
      }

      // upload any queued full-resolution files now that we have a real beatId
      for (const { file, kind } of pendingFiles) {
        const storageKey = await uploadToR2({ file, beatId: beatId!, folder: "files" });
        await fetch(`/api/beats/${beatId}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storageKey, fileName: file.name, kind, sizeBytes: file.size }),
        });
      }

      toast.success(isEdit ? "Beat updated" : "Beat created");
      router.push("/admin/beats");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <section className="space-y-4 rounded-xs border border-line bg-panel p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-lo">Beat details</h2>

        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input" />
        </Field>

        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Field label="BPM">
            <input type="number" value={bpm} onChange={(e) => setBpm(e.target.value)} required className="input" />
          </Field>
          <Field label="Key">
            <select value={key} onChange={(e) => setKey(e.target.value)} className="input">
              {KEY_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Genre">
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className="input">
              {GENRE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Mood">
            <select value={mood} onChange={(e) => setMood(e.target.value)} className="input">
              {MOOD_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Tags (comma separated)">
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="summer, chill, guitar" className="input" />
        </Field>

        <div className="flex items-center gap-6">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="input">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 pt-5 text-sm text-hi">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-blue" />
            Featured
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xs border border-line bg-panel p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-lo">Media</h2>
        <Field label="Artwork (image)">
          <input type="file" accept="image/*" onChange={(e) => setArtworkFile(e.target.files?.[0] || null)} className="input" />
          {existing?.artworkUrl && !artworkFile && <p className="mt-1 text-xs text-lo">Current artwork on file — choose a new file to replace it.</p>}
        </Field>
        <Field label="Tagged/watermarked preview (MP3)">
          <input type="file" accept="audio/*" onChange={(e) => setPreviewFile(e.target.files?.[0] || null)} className="input" />
          {existing?.title && !previewFile && <p className="mt-1 text-xs text-lo">Choose a new file to replace the current preview.</p>}
        </Field>
      </section>

      <section className="space-y-4 rounded-xs border border-line bg-panel p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-lo">Full-resolution deliverables</h2>
        <p className="text-xs text-lo">
          These are private — only ever delivered to customers via signed download links after payment.
        </p>

        {existingFiles.length > 0 && (
          <ul className="space-y-1.5">
            {existingFiles.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-xs border border-line px-3 py-2 text-xs">
                <span>[{f.kind}] {f.fileName}</span>
                <button type="button" onClick={() => handleDeleteExistingFile(f.id)} className="text-red hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {pendingFiles.length > 0 && (
          <ul className="space-y-1.5">
            {pendingFiles.map((p, i) => (
              <li key={i} className="flex items-center justify-between rounded-xs border border-dashed border-line px-3 py-2 text-xs text-lo">
                <span>[{p.kind}] {p.file.name} (will upload on save)</span>
                <button type="button" onClick={() => setPendingFiles((arr) => arr.filter((_, idx) => idx !== i))} className="text-red hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {["MP3", "WAV", "STEMS", "TRACKOUT"].map((kind) => (
            <Field key={kind} label={kind}>
              <input type="file" onChange={addPendingFile(kind)} className="input text-xs" />
            </Field>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xs border border-line bg-panel p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-lo">License options</h2>
        {templates.length === 0 && (
          <p className="text-xs text-lo">
            No license types yet — create some on the <a href="/admin/licenses" className="text-blue hover:underline">License types</a> page first.
          </p>
        )}
        {templates.map((t) => (
          <div key={t.id} className="flex items-center gap-4 rounded-xs border border-line p-3">
            <input
              type="checkbox"
              checked={selection[t.id]?.selected || false}
              onChange={(e) =>
                setSelection((s) => ({ ...s, [t.id]: { ...s[t.id], selected: e.target.checked } }))
              }
              className="accent-blue"
            />
            <span className="flex-1 text-sm text-hi">
              {t.name} {t.isExclusive && <span className="text-sun">(exclusive)</span>}
            </span>
            <span className="text-xs text-lo">£</span>
            <input
              type="number"
              step="0.01"
              value={selection[t.id]?.price ?? t.defaultPrice}
              onChange={(e) =>
                setSelection((s) => ({ ...s, [t.id]: { ...s[t.id], price: e.target.value } }))
              }
              className="w-24 rounded-xs border border-line bg-void px-2 py-1 text-sm text-hi"
            />
          </div>
        ))}
      </section>

      <button
        disabled={saving}
        className="w-full rounded-xs bg-blue py-3.5 text-sm font-bold text-hi transition hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : isEdit ? "Save changes" : "Create beat"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 2px;
          border: 1px solid #23262c;
          background: #0a0b0d;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          color: #f3f4f1;
        }
        .input:focus {
          outline: none;
          border-color: #2e5cff;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-lo">{label}</span>
      {children}
    </label>
  );
}
