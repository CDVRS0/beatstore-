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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const { track, isPlaying, play, toggle } = usePlayerStore();
  const isCurrent = track?.beatId === beatId;

  useEffect(() => {
    let cancelled = false;
    let audioContext: AudioContext | null = null;

    async function loadWaveform() {
      try {
        const response = await fetch(previewUrl);
        const buffer = await response.arrayBuffer();
        audioContext = new AudioContext();
        const decoded = await audioContext.decodeAudioData(buffer);
        const samples = decoded.getChannelData(0);
        const barCount = 96;
        const samplesPerBar = Math.max(1, Math.floor(samples.length / barCount));
        const nextPeaks = Array.from({ length: barCount }, (_, index) => {
          const start = index * samplesPerBar;
          const end = Math.min(samples.length, start + samplesPerBar);
          let peak = 0;
          for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
            peak = Math.max(peak, Math.abs(samples[sampleIndex]));
          }
          return peak;
        });
        if (!cancelled) setPeaks(nextPeaks);
      } catch {
        if (!cancelled) setPeaks([]);
      } finally {
        await audioContext?.close();
      }
    }

    loadWaveform();
    return () => {
      cancelled = true;
      audioContext?.close();
    };
  }, [previewUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0) return;
    const container = canvas.parentElement;
    if (!container) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.scale(pixelRatio, pixelRatio);
      context.clearRect(0, 0, width, height);
      const barWidth = Math.max(1, width / peaks.length - 2);
      peaks.forEach((peak, index) => {
        const barHeight = Math.max(4, peak * height * 0.9);
        const x = index * (width / peaks.length);
        context.fillStyle = isCurrent && isPlaying ? "#2E5CFF" : "#23262C";
        context.beginPath();
        context.roundRect(x, (height - barHeight) / 2, barWidth, barHeight, barWidth / 2);
        context.fill();
      });
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
  }, [peaks, isCurrent, isPlaying]);

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
          <canvas ref={canvasRef} className="block h-full w-full" />
        </div>
      </div>
      <p className="mt-3 text-xs text-lo">Tagged preview. Untagged files are unlocked after purchase.</p>
    </div>
  );
}
