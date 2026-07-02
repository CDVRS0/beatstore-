"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePlayerStore } from "@/context/PlayerContext";

export default function PersistentPlayer() {
  const { track, isPlaying, toggle, close } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const countedRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.src !== track.previewUrl) {
      audio.src = track.previewUrl;
      countedRef.current = null;
    }
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [track, isPlaying]);

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(audio.currentTime);
    setDuration(audio.duration || 0);

    // count a play once the listener has heard at least 5s of the preview
    if (track && audio.currentTime > 5 && countedRef.current !== track.beatId) {
      countedRef.current = track.beatId;
      fetch(`/api/beats/${track.beatId}`, { method: "PATCH" }).catch(() => {});
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  }

  if (!track) return null;

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-panel/95 backdrop-blur">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => usePlayerStore.setState({ isPlaying: false })}
      />
      <div
        className="h-1 w-full cursor-pointer bg-line"
        onClick={seek}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={progress}
      >
        <div className="h-full bg-blue" style={{ width: `${pct}%` }} />
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-8">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xs bg-panel2">
          {track.artworkUrl && (
            <Image src={track.artworkUrl} alt="" fill className="object-cover" sizes="40px" />
          )}
        </div>
        <button
          onClick={toggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue text-hi"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-hi">{track.title}</div>
          <div className="font-mono text-xs text-lo">
            {formatTime(progress)} / {formatTime(duration)}
          </div>
        </div>
        <button onClick={close} className="text-lo hover:text-hi" aria-label="Close player">
          ✕
        </button>
      </div>
    </div>
  );
}

function formatTime(sec: number) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
