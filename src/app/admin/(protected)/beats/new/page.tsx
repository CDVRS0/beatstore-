import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import BeatForm from "@/components/admin/BeatForm";

export default async function NewBeatPage() {
  const templates = await prisma.licenseTemplate.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-hi">Upload a new beat</h1>
      <BeatForm
        templates={templates.map((t) => ({ id: t.id, name: t.name, defaultPrice: t.defaultPrice.toString(), isExclusive: t.isExclusive }))}
      />
    </div>
  );
}
