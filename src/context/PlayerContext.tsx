"use client";

import { create } from "zustand";

export type PlayerTrack = {
  beatId: string;
  title: string;
  artworkUrl: string | null;
  previewUrl: string;
};

type PlayerState = {
  track: PlayerTrack | null;
  isPlaying: boolean;
  play: (track: PlayerTrack) => void;
  toggle: () => void;
  pause: () => void;
  close: () => void;
};

/**
 * Holds *which* track should be playing. The actual <audio> element lives
 * once in the root layout (see components/PersistentPlayer.tsx) so it keeps
 * playing across client-side route changes instead of remounting per page.
 */
export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  isPlaying: false,
  play: (track) => {
    const current = get().track;
    if (current?.beatId === track.beatId) {
      set({ isPlaying: true });
    } else {
      set({ track, isPlaying: true });
    }
  },
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  pause: () => set({ isPlaying: false }),
  close: () => set({ track: null, isPlaying: false }),
}));
