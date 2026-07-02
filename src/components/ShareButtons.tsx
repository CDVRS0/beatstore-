"use client";

import toast from "react-hot-toast";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  async function copyLink() {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`${title} — beat by CDVRS`);

  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  return (
    <div className="flex items-center gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xs border border-line px-2.5 py-1 text-xs text-lo hover:border-blue hover:text-hi"
        >
          {l.label}
        </a>
      ))}
      <button onClick={copyLink} className="rounded-xs border border-line px-2.5 py-1 text-xs text-lo hover:border-blue hover:text-hi">
        Copy link
      </button>
    </div>
  );
}
