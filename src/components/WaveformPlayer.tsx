"use client";

import { usePlayerStore } from "@/context/PlayerContext";

export default function WaveformPlayer({
  beatId,
  title,
  artworkUrl,
  previewUrl,
}: {
  beatId: string;
  title: string;
  artworkUrl: string | null;
  previewUrl: string;
}) {
  const { track, isPlaying, play, toggle } = usePlayerStore();
  const isCurrent = track?.beatId === beatId;

  function handleMainButton() {
    if (isCurrent) toggle();
    else play({ beatId, title, artworkUrl, previewUrl });
  }

  return (
    <div className="rounded-xs border border-line bg-panel p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={handleMainButton}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue text-lg text-hi transition hover:opacity-90"
          aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
        >
          {isCurrent && isPlaying ? "❚❚" : "▶"}
        </button>
        <div
          className="flex h-24 w-full flex-1 cursor-pointer items-center gap-1"
          onClick={handleMainButton}
          aria-hidden="true"
        >
          {Array.from({ length: 64 }, (_, index) => (
            <span
              key={index}
              className={`w-full rounded-full ${isCurrent && isPlaying ? "bg-blue" : "bg-line"}`}
              style={{ height: `${24 + ((index * 17) % 56)}%` }}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-lo">Tagged preview. Untagged files are unlocked after purchase.</p>
    </div>
  );
}
