"use client";

import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export type LicenseData = {
  id: string;
  name: string;
  price: number;
  fileFormats: string[];
  streamLimit: number | null;
  distributionLimit: number | null;
  musicVideos: boolean;
  performanceRights: boolean;
  commercialUse: boolean;
  isExclusive: boolean;
};

export default function LicenseCard({ beatId, license, highlight }: { beatId: string; license: LicenseData; highlight?: boolean }) {
  const router = useRouter();

  const rows: { label: string; value: string }[] = [
    { label: "Formats", value: license.fileFormats.join(", ") },
    { label: "Streams", value: license.streamLimit ? license.streamLimit.toLocaleString() : "Unlimited" },
    { label: "Distribution", value: license.distributionLimit ? license.distributionLimit.toLocaleString() : "Unlimited" },
    { label: "Music videos", value: license.musicVideos ? "Included" : "Not included" },
    { label: "Performance rights", value: license.performanceRights ? "Included" : "Not included" },
    { label: "Commercial use", value: license.commercialUse ? "Yes" : "No" },
  ];

  return (
    <div
      className={`flex flex-col rounded-xs border p-5 ${
        highlight ? "border-blue shadow-glow" : "border-line"
      } ${license.isExclusive ? "bg-gradient-to-b from-sun/10 to-panel" : "bg-panel"}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-hi">{license.name}</h3>
        {license.isExclusive && (
          <span className="rounded-xs bg-sun/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-sun">Exclusive</span>
        )}
      </div>
      <div className="mt-1 text-2xl font-bold text-hi">{formatPrice(license.price)}</div>

      <ul className="mt-4 flex-1 space-y-1.5 text-xs text-lo">
        {rows.map((r) => (
          <li key={r.label} className="flex justify-between border-b border-line/60 py-1">
            <span>{r.label}</span>
            <span className="text-hi">{r.value}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => router.push(`/license-agreement/${beatId}/${license.id}`)}
        className="mt-4 rounded-xs bg-blue py-2.5 text-sm font-bold text-hi transition hover:opacity-90"
      >
        Select license
      </button>
    </div>
  );
}
