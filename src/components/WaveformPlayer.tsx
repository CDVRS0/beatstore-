"use client";

import { useEffect, useRef, useState } from "react";
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
  const waveformRef = useRef<HTMLDivElement>(null);
  const [waveformReady, setWaveformReady] = useState(false);
  const { track, isPlaying, play, toggle } = usePlayerStore();
  const isCurrent = track?.beatId === beatId;

  useEffect(() => {
    if (!waveformRef.current) return;
    let destroyed = false;
    let wavesurfer: any = null;

    (async () => {
      const WaveSurfer = (await import("wavesurfer.js")).default;
      if (destroyed || !waveformRef.current) return;
      wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#23262C",
        progressColor: "#2E5CFF",
        cursorColor: "transparent",
        barWidth: 3,
        barGap: 2,
        barRadius: 2,
        height: 96,
        url: previewUrl,
        interact: false,
        hideScrollbar: true,
      });
      wavesurfer.on("ready", () => {
        if (!destroyed) setWaveformReady(true);
      });
    })();

    return () => {
      destroyed = true;
      wavesurfer?.destroy();
    };
  }, [previewUrl]);

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
          <div ref={waveformRef} className="h-24 w-full" />
        </div>
      </div>
      {!waveformReady && <p className="mt-2 text-xs text-lo">Loading waveform...</p>}
      <p className="mt-3 text-xs text-lo">Tagged preview. Untagged files are unlocked after purchase.</p>
    </div>
  );
}
