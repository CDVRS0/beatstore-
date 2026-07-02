"use client";

import Image from "next/image";
import Link from "next/link";
import { usePlayerStore } from "@/context/PlayerContext";
import { formatPrice } from "@/lib/utils";

export type BeatCardData = {
  id: string;
  slug: string;
  title: string;
  artworkUrl: string | null;
  previewUrl: string | null;
  bpm: number;
  key: string;
  genre: string;
  mood: string;
  exclusiveSold: boolean;
  minPrice: number | null;
};

export default function BeatCard({ beat }: { beat: BeatCardData }) {
  const { track, isPlaying, play, toggle } = usePlayerStore();
  const isCurrent = track?.beatId === beat.id;

  function handlePlay(e: React.MouseEvent) {
    e.preventDefault();
    if (!beat.previewUrl) return;
    if (isCurrent) toggle();
    else play({ beatId: beat.id, title: beat.title, artworkUrl: beat.artworkUrl, previewUrl: beat.previewUrl });
  }

  return (
    <Link
      href={`/beats/${beat.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xs border border-line bg-panel transition hover:border-blue/60"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-panel2">
        {beat.artworkUrl ? (
          <Image
            src={beat.artworkUrl}
            alt={beat.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 280px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-lo">CDVRS</div>
        )}

        {beat.exclusiveSold && (
          <span className="absolute left-2 top-2 rounded-xs bg-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-hi">
            Exclusive sold
          </span>
        )}

        <button
          onClick={handlePlay}
          aria-label={isCurrent && isPlaying ? "Pause preview" : "Play preview"}
          className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-void/80 text-hi opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-blue"
        >
          {isCurrent && isPlaying ? "❚❚" : "▶"}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="truncate font-display text-sm font-bold text-hi">{beat.title}</div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="led-readout rounded-xs px-1.5 py-0.5">{beat.bpm} BPM</span>
          <span className="led-readout rounded-xs px-1.5 py-0.5">{beat.key}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-lo">
          <span>{beat.genre} · {beat.mood}</span>
        </div>
        <div className="mt-auto pt-1 text-sm font-bold text-hi">
          {beat.exclusiveSold ? (
            <span className="text-lo">Not for sale</span>
          ) : beat.minPrice != null ? (
            <>From {formatPrice(beat.minPrice)}</>
          ) : (
            <span className="text-lo">—</span>
          )}
        </div>
      </div>
    </Link>
  );
}
