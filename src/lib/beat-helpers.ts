import { publicUrl } from "@/lib/r2";
import type { BeatCardData } from "@/components/BeatCard";

type BeatWithLicensesRaw = {
  id: string;
  slug: string;
  title: string;
  artworkKey: string | null;
  previewKey: string | null;
  bpm: number;
  key: string;
  genre: string;
  mood: string;
  exclusiveSold: boolean;
  licenses: { price: any }[];
};

export function toBeatCard(beat: BeatWithLicensesRaw): BeatCardData {
  const prices = beat.licenses.map((l) => Number(l.price));
  return {
    id: beat.id,
    slug: beat.slug,
    title: beat.title,
    artworkUrl: beat.artworkKey ? publicUrl(beat.artworkKey) : null,
    previewUrl: beat.previewKey ? publicUrl(beat.previewKey) : null,
    bpm: beat.bpm,
    key: beat.key,
    genre: beat.genre,
    mood: beat.mood,
    exclusiveSold: beat.exclusiveSold,
    minPrice: prices.length ? Math.min(...prices) : null,
  };
}
