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
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const { track, isPlaying, play, toggle } = usePlayerStore();
  const isCurrent = track?.beatId === beatId;

  useEffect(() => {
    let destroyed = false;
    (async () => {
      const WaveSurfer = (await import("wavesurfer.js")).default;
      if (destroyed || !containerRef.current) return;
      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#23262C",
        progressColor: "#2E5CFF",
        cursorColor: "#F3F4F1",
        barWidth: 3,
        barGap: 2,
        barRadius: 2,
        height: 96,
        url: previewUrl,
        interact: true,
      });
      ws.on("ready", () => setReady(true));
      ws.on("click", () => {
        if (!isCurrent) play({ beatId, title, artworkUrl, previewUrl });
      });
      wavesurferRef.current = ws;
    })();
    return () => {
      destroyed = true;
      wavesurferRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl]);

  // keep this waveform's play-head in sync with the global player only when it's the active track
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    if (isCurrent) {
      if (isPlaying && !ws.isPlaying()) ws.play();
      if (!isPlaying && ws.isPlaying()) ws.pause();
    } else {
      if (ws.isPlaying()) ws.pause();
    }
  }, [isCurrent, isPlaying]);

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
        <div ref={containerRef} className="w-full flex-1" />
      </div>
      {!ready && <p className="mt-2 text-xs text-lo">Loading waveform…</p>}
      <p className="mt-3 text-xs text-lo">Tagged preview. Untagged files are unlocked after purchase.</p>
    </div>
  );
}
