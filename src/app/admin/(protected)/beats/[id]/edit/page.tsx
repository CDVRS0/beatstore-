import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/lib/r2";
import BeatForm from "@/components/admin/BeatForm";

export default async function EditBeatPage({ params }: { params: { id: string } }) {
  const [beat, templates] = await Promise.all([
    prisma.beat.findUnique({
      where: { id: params.id },
      include: { licenses: true, files: true },
    }),
    prisma.licenseTemplate.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!beat) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-hi">Edit {beat.title}</h1>
      <BeatForm
        templates={templates.map((t) => ({ id: t.id, name: t.name, defaultPrice: t.defaultPrice.toString(), isExclusive: t.isExclusive }))}
        existing={{
          id: beat.id,
          title: beat.title,
          description: beat.description,
          bpm: beat.bpm,
          key: beat.key,
          genre: beat.genre,
          mood: beat.mood,
          tags: beat.tags,
          status: beat.status,
          featured: beat.featured,
          artworkUrl: beat.artworkKey ? publicUrl(beat.artworkKey) : null,
          licenses: beat.licenses.map((l) => ({ id: l.id, templateId: l.templateId, price: l.price.toString() })),
          files: beat.files.map((f) => ({ id: f.id, kind: f.kind, fileName: f.fileName })),
        }}
      />
    </div>
  );
}
