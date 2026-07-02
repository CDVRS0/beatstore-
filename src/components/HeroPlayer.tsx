"use client";

import Image from "next/image";
import Link from "next/link";
import WaveformPlayer from "./WaveformPlayer";

type HeroBeat = {
  id: string;
  slug: string;
  title: string;
  artworkUrl: string | null;
  previewUrl: string | null;
  bpm: number;
  key: string;
  genre: string;
  mood: string;
};

export default function HeroPlayer({ beat }: { beat: HeroBeat }) {
  return (
    <div className="w-full rounded-xs border border-line bg-panel p-5">
      <div className="flex gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xs bg-panel2">
          {beat.artworkUrl && <Image src={beat.artworkUrl} alt={beat.title} fill className="object-cover" sizes="96px" />}
        </div>
        <div className="min-w-0">
          <Link href={`/beats/${beat.slug}`} className="font-display text-lg font-bold text-hi hover:text-blue">
            {beat.title}
          </Link>
          <div className="mt-1 text-xs text-lo">{beat.genre} · {beat.mood}</div>
          <div className="mt-2 flex gap-1.5">
            <span className="led-readout rounded-xs px-1.5 py-0.5 text-[11px]">{beat.bpm} BPM</span>
            <span className="led-readout rounded-xs px-1.5 py-0.5 text-[11px]">{beat.key}</span>
          </div>
        </div>
      </div>

      {beat.previewUrl && (
        <div className="mt-4">
          <WaveformPlayer beatId={beat.id} title={beat.title} artworkUrl={beat.artworkUrl} previewUrl={beat.previewUrl} />
        </div>
      )}

      <Link href={`/beats/${beat.slug}`} className="mt-4 block text-center text-sm font-bold text-blue hover:underline">
        View licenses →
      </Link>
    </div>
  );
}
