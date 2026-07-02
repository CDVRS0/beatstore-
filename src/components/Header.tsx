"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/context/CartContext";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const cartCount = useCartStore((s) => s.items.length);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/shop?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 md:px-8">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-hi shrink-0">
          CDVRS<span className="text-blue">.</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 md:block">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search beats, genres, tags…"
            className="w-full max-w-md rounded-xs border border-line bg-panel px-4 py-2 text-sm text-hi placeholder:text-lo focus:border-blue"
          />
        </form>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-lo transition hover:text-hi">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/wishlist" className="text-sm text-lo transition hover:text-hi" aria-label="Wishlist">
            ♡
          </Link>
          <Link href="/cart" className="relative text-sm text-lo transition hover:text-hi" aria-label="Cart">
            Cart
            {cartCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue text-[10px] font-bold text-hi">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className="hidden rounded-xs border border-line px-3 py-1.5 text-sm text-hi transition hover:border-blue md:block"
          >
            Account
          </Link>
          <button className="md:hidden text-hi" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line px-4 py-3 md:hidden">
          <form onSubmit={handleSearch} className="mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search beats…"
              className="w-full rounded-xs border border-line bg-panel px-4 py-2 text-sm text-hi placeholder:text-lo"
            />
          </form>
          <div className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-lo" onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/account" className="text-sm text-lo" onClick={() => setMenuOpen(false)}>
              Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
