"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (beatId: string, licenseId: string) => void;
  clear: () => void;
  acceptAgreement: (beatId: string, licenseId: string) => void;
  total: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.beatId === item.beatId && i.licenseId === item.licenseId);
          if (exists) return state;
          // A beat can only be in the cart under one license at a time
          const withoutBeat = state.items.filter((i) => i.beatId !== item.beatId);
          return { items: [...withoutBeat, item] };
        }),
      removeItem: (beatId, licenseId) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.beatId === beatId && i.licenseId === licenseId)),
        })),
      clear: () => set({ items: [] }),
      acceptAgreement: (beatId, licenseId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.beatId === beatId && i.licenseId === licenseId ? { ...i, agreementAccepted: true } : i
          ),
        })),
      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
    }),
    { name: "cdvrs-cart" }
  )
);
