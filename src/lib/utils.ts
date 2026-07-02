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

const GENRE_OPTIONS = [
  "Trap",
  "Melodic Trap",
  "Drill",
  "UK Drill",
  "Jersey Club",
  "Rage",
  "Pluggnb",
  "Plugg",
  "Boom Bap",
  "Lo-Fi Hip Hop",
  "Conscious Hip Hop",
  "East Coast Hip Hop",
  "West Coast Hip Hop",
  "Southern Hip Hop",
  "Memphis Rap",
  "Cloud Rap",
  "Emo Rap",
  "Alternative Hip Hop",
  "Gangsta Rap",
  "Horrorcore",
  "Jazz Rap",
  "Experimental Hip Hop",
  "Hyperpop Rap",
  "Phonk",
  "Trap Soul",
  "Detroit Rap",
  "Flint Rap",
  "Bounce",
  "Crunk",
  "G-Funk",
  "Contemporary R&B",
  "Alternative R&B",
  "Neo Soul",
  "Soul",
  "Quiet Storm",
  "Trap R&B",
  "Bedroom R&B",
  "Afro R&B",
  "Pop",
  "Dance Pop",
  "Electropop",
  "Indie Pop",
  "Dream Pop",
  "Synth Pop",
  "Pop Rap",
  "Teen Pop",
  "Dark Pop",
  "EDM",
  "House",
  "Deep House",
  "Tech House",
  "Future House",
  "Progressive House",
  "Electro House",
  "Bass House",
  "Tropical House",
  "Afro House",
  "UK Garage",
  "Speed Garage",
  "Future Garage",
  "Drum & Bass",
  "Jungle",
  "Dubstep",
  "Future Bass",
  "Trap EDM",
  "Hardstyle",
  "Techno",
  "Trance",
  "Synthwave",
  "Chillwave",
  "Ambient",
  "Downtempo",
  "Alternative Rock",
  "Indie Rock",
  "Pop Rock",
  "Punk Rock",
  "Pop Punk",
  "Emo",
  "Metalcore",
  "Hard Rock",
  "Soft Rock",
  "Grunge",
  "Reggaeton",
  "Latin Trap",
  "Dembow",
  "Latin Pop",
  "Bachata",
  "Salsa",
  "Merengue",
  "Corridos",
  "Corridos Tumbados",
  "Afrobeats",
  "Afro Fusion",
  "Afro Swing",
  "Afro Pop",
  "Amapiano",
  "Afro House",
  "Dancehall",
  "Reggae",
  "Soca",
  "Bashment",
  "Funk",
  "Funk Fusion",
  "Disco",
  "Gospel",
  "Motown",
  "Jazz",
  "Smooth Jazz",
  "Blues",
  "Jazz Fusion",
  "Arabic",
  "Bollywood",
  "Indian Fusion",
  "K-Pop",
  "J-Pop",
  "Asian Fusion",
  "Orchestral",
  "Epic",
  "Trailer",
  "Emotional",
  "Dark Cinematic",
  "Ambient Cinematic",
  "Hybrid Orchestral",
  "Chillhop",
  "Chillout",
  "Lo-Fi",
  "Study Beats",
  "Sleep",
  "Meditation",
  "Hyperpop",
  "Glitch",
  "Experimental",
  "Industrial",
  "Witch House",
  "Vaporwave",
];
const MOOD_OPTIONS = [
  "Dark",
  "Aggressive",
  "Emotional",
  "Sad",
  "Melodic",
  "Chill",
  "Relaxed",
  "Hard",
  "Hype",
  "Energetic",
  "Atmospheric",
  "Cinematic",
  "Moody",
  "Romantic",
  "Dreamy",
  "Spacey",
  "Euphoric",
  "Gritty",
  "Bouncy",
  "Evil",
  "Luxury",
  "Victory",
  "Motivational",
  "Mysterious",
  "Epic",
];

export { KEY_OPTIONS, GENRE_OPTIONS, MOOD_OPTIONS };
