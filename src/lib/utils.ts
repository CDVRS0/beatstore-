import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(value: number | string, currency = "GBP") {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(num);
}

export function generateOrderNumber() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  const date = new Date();
  const stamp = `${date.getFullYear().toString().slice(2)}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
  return `CDVRS-${stamp}-${rand}`;
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/$/, "");

  return "http://localhost:3000";
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const KEY_OPTIONS = [
  "C Major", "C Minor", "C# Major", "C# Minor", "D Major", "D Minor",
  "D# Major", "D# Minor", "E Major", "E Minor", "F Major", "F Minor",
  "F# Major", "F# Minor", "G Major", "G Minor", "G# Major", "G# Minor",
  "A Major", "A Minor", "A# Major", "A# Minor", "B Major", "B Minor",
];

const GENRE_OPTIONS = ["Lofi Hip Hop", "Amapiano", "Miami Bass", "Trap", "R&B", "Afrobeat", "Boom Bap", "Drill"];
const MOOD_OPTIONS = ["Feel Good", "Chill", "Dark", "Energetic", "Melancholy", "Romantic", "Aggressive", "Dreamy"];

export { KEY_OPTIONS, GENRE_OPTIONS, MOOD_OPTIONS };
