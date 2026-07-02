import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/lib/r2";
import { toBeatCard } from "@/lib/beat-helpers";
import { getSiteUrl } from "@/lib/utils";
import WaveformPlayer from "@/components/WaveformPlayer";
import LicenseCard from "@/components/LicenseCard";
import BeatCard from "@/components/BeatCard";
import ShareButtons from "@/components/ShareButtons";
import WishlistButton from "@/components/WishlistButton";

async function getBeat(slug: string) {
  return prisma.beat.findUnique({
    where: { slug },
    include: { licenses: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const beat = await getBeat(params.slug);
  if (!beat) return {};
  return {
    title: beat.title,
    description: beat.description || `${beat.genre} beat, ${beat.bpm} BPM, ${beat.key}. Produced by CDVRS.`,
    openGraph: {
      images: beat.artworkKey ? [publicUrl(beat.artworkKey)] : [],
    },
  };
}

export default async function BeatDetailPage({ params }: { params: { slug: string } }) {
  const beat = await getBeat(params.slug);
  if (!beat || beat.status !== "PUBLISHED") notFound();

  const similar = await prisma.beat.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: beat.id },
      OR: [{ genre: beat.genre }, { mood: beat.mood }],
    },
    take: 4,
    include: { licenses: { select: { price: true } } },
  });

  const artworkUrl = beat.artworkKey ? publicUrl(beat.artworkKey) : null;
  const previewUrl = beat.previewKey ? publicUrl(beat.previewKey) : null;
  const siteUrl = getSiteUrl();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-xs border border-line bg-panel2">
            {artworkUrl && <Image src={artworkUrl} alt={beat.title} fill className="object-cover" sizes="280px" priority />}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <WishlistButton beatId={beat.id} />
            <ShareButtons url={`${siteUrl}/beats/${beat.slug}`} title={beat.title} />
          </div>
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-hi">{beat.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="led-readout rounded-xs px-2 py-1">{beat.bpm} BPM</span>
            <span className="led-readout rounded-xs px-2 py-1">{beat.key}</span>
            <span className="rounded-xs border border-line px-2 py-1 text-lo">{beat.genre}</span>
            <span className="rounded-xs border border-line px-2 py-1 text-lo">{beat.mood}</span>
            <span className="text-lo">{beat.playCount.toLocaleString()} plays</span>
          </div>

          {beat.description && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-lo">{beat.description}</p>}

          {beat.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {beat.tags.map((tag) => (
                <span key={tag} className="rounded-xs bg-panel2 px-2 py-0.5 text-[11px] text-lo">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6">
            {previewUrl ? (
              <WaveformPlayer beatId={beat.id} title={beat.title} artworkUrl={artworkUrl} previewUrl={previewUrl} />
            ) : (
              <div className="rounded-xs border border-dashed border-line p-6 text-center text-sm text-lo">
                Preview coming soon.
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 font-display text-xl font-bold text-hi">
          {beat.exclusiveSold ? "Exclusive rights sold" : "Choose a license"}
        </h2>
        {beat.exclusiveSold ? (
          <div className="rounded-xs border border-red/40 bg-red/5 p-6 text-sm text-lo">
            This beat's exclusive rights have been purchased and it is no longer available for licensing.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {beat.licenses.map((license, i) => (
              <LicenseCard
                key={license.id}
                beatId={beat.id}
                highlight={i === Math.min(2, beat.licenses.length - 1)}
                license={{
                  id: license.id,
                  name: license.name,
                  price: Number(license.price),
                  fileFormats: license.fileFormats,
                  streamLimit: license.streamLimit,
                  distributionLimit: license.distributionLimit,
                  musicVideos: license.musicVideos,
                  performanceRights: license.performanceRights,
                  commercialUse: license.commercialUse,
                  isExclusive: license.isExclusive,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 font-display text-xl font-bold text-hi">Similar beats</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {similar.map((b) => (
              <BeatCard key={b.id} beat={toBeatCard(b)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
