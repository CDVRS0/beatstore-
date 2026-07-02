import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PersistentPlayer from "@/components/PersistentPlayer";
import Providers from "@/components/Providers";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { getSiteUrl } from "@/lib/utils";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "700"] });

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CDVRS — Beats for artists building their own world",
    template: "%s · CDVRS",
  },
  description:
    "Lofi hip hop, amapiano, and miami bass beats produced by CDVRS. License instantly, download immediately, own your sound.",
  openGraph: {
    type: "website",
    siteName: "CDVRS",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-void font-body text-hi antialiased">
        <GoogleAnalytics />
        <Providers>
          <Header />
          <main className="pb-24">{children}</main>
          <Footer />
          <PersistentPlayer />
        </Providers>
      </body>
    </html>
  );
}
