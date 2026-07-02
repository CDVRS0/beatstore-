import { prisma } from "@/lib/prisma";
import { toBeatCard } from "@/lib/beat-helpers";

export const dynamic = "force-dynamic";
import BeatCard from "@/components/BeatCard";
import FilterSidebar from "@/components/FilterSidebar";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Shop beats",
  description: "Browse beats. Filter by genre, mood, BPM, and key.",
};

const PAGE_SIZE = 24;

export default async function ShopPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const { q, genre, mood, key, bpmMin, bpmMax, sort, page } = searchParams;

  const where: Prisma.BeatWhereInput = { status: "PUBLISHED" };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
      { genre: { contains: q, mode: "insensitive" } },
    ];
  }
  if (genre) where.genre = { in: genre.split(",") };
  if (mood) where.mood = { in: mood.split(",") };
  if (key) where.key = key;
  if (bpmMin || bpmMax) {
    where.bpm = {
      ...(bpmMin ? { gte: parseInt(bpmMin) } : {}),
      ...(bpmMax ? { lte: parseInt(bpmMax) } : {}),
    };
  }

  const orderBy: Prisma.BeatOrderByWithRelationInput =
    sort === "featured" ? { featured: "desc" } : sort === "new" ? { createdAt: "desc" } : { createdAt: "desc" };

  const currentPage = Math.max(1, parseInt(page || "1"));

  const [beats, total] = await Promise.all([
    prisma.beat.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { licenses: { select: { price: true } } },
    }),
    prisma.beat.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-hi">
        {q ? `Results for "${q}"` : "Shop beats"}
      </h1>
      <div className="flex flex-col gap-8 md:flex-row">
        <FilterSidebar />
        <div className="flex-1">
          <div className="mb-4 text-sm text-lo">{total} beat{total === 1 ? "" : "s"}</div>
          {beats.length === 0 ? (
            <div className="rounded-xs border border-dashed border-line p-12 text-center text-lo">
              No beats match those filters. Try clearing some and searching again.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {beats.map((b) => (
                <BeatCard key={b.id} beat={toBeatCard(b)} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <a
                  key={i}
                  href={`?${new URLSearchParams({ ...searchParams, page: String(i + 1) } as Record<string, string>).toString()}`}
                  className={`rounded-xs border px-3 py-1.5 text-xs ${
                    currentPage === i + 1 ? "border-blue text-blue" : "border-line text-lo hover:text-hi"
                  }`}
                >
                  {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
