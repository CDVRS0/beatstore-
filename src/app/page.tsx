import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toBeatCard } from "@/lib/beat-helpers";

export const dynamic = "force-dynamic";
import { publicUrl } from "@/lib/r2";
import BeatCard from "@/components/BeatCard";
import HeroPlayer from "@/components/HeroPlayer";

export const revalidate = 60;

async function getData() {
  const licenseSelect = { select: { price: true } };

  const [hero, featured, recent, bestSellerRows] = await Promise.all([
    prisma.beat.findFirst({
      where: { status: "PUBLISHED", featured: true },
      orderBy: { createdAt: "desc" },
      include: { licenses: licenseSelect },
    }),
    prisma.beat.findMany({
      where: { status: "PUBLISHED", featured: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { licenses: licenseSelect },
    }),
    prisma.beat.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { licenses: licenseSelect },
    }),
    prisma.orderItem.groupBy({
      by: ["beatId"],
      _count: { beatId: true },
      orderBy: { _count: { beatId: "desc" } },
      take: 8,
    }),
  ]);

  const bestSellerIds = bestSellerRows.map((r) => r.beatId);
  const bestSellers = bestSellerIds.length
    ? await prisma.beat.findMany({
        where: { id: { in: bestSellerIds }, status: "PUBLISHED" },
        include: { licenses: licenseSelect },
      })
    : [];

  return { hero, featured, recent, bestSellers };
}

export default async function HomePage() {
  const { hero, featured, recent, bestSellers } = await getData();

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-panel to-void">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-xs border border-line px-2 py-1 text-[11px] uppercase tracking-wider text-lo">
              <span className="led-dot animate-blink" /> New drop
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-hi md:text-6xl">
              Beats built for<br />your world.
            </h1>
            <p className="mt-4 max-w-md text-sm text-lo md:text-base">
              Lofi hip hop, amapiano, and miami bass, produced by CDVRS. Instant licensing, instant download, no
              subscriptions, no middleman.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/shop" className="rounded-xs bg-blue px-5 py-3 text-sm font-bold text-hi transition hover:opacity-90">
                Browse the shop
              </Link>
              <Link href="#featured" className="rounded-xs border border-line px-5 py-3 text-sm font-bold text-hi transition hover:border-blue">
                See featured
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {hero ? (
              <HeroPlayer
                beat={{
                  id: hero.id,
                  slug: hero.slug,
                  title: hero.title,
                  artworkUrl: hero.artworkKey ? publicUrl(hero.artworkKey) : null,
                  previewUrl: hero.previewKey ? publicUrl(hero.previewKey) : null,
                  bpm: hero.bpm,
                  key: hero.key,
                  genre: hero.genre,
                  mood: hero.mood,
                }}
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-xs border border-dashed border-line text-lo">
                Mark a beat as "Featured" in the admin dashboard to spotlight it here.
              </div>
            )}
          </div>
        </div>
      </section>

      <Rail id="featured" title="Featured beats" beats={featured} />
      <Rail title="Best sellers" beats={bestSellers} />
      <Rail title="Recently added" beats={recent} />
    </div>
  );
}

function Rail({ id, title, beats }: { id?: string; title: string; beats: any[] }) {
  if (!beats.length) return null;
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-hi">{title}</h2>
        <Link href="/shop" className="text-xs text-lo hover:text-hi">View all →</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {beats.map((b) => (
          <BeatCard key={b.id} beat={toBeatCard(b)} />
        ))}
      </div>
    </section>
  );
}
