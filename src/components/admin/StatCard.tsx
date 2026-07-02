export default function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xs border border-line bg-panel p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-lo">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold text-hi">{value}</div>
      {sub && <div className="mt-1 text-xs text-lo">{sub}</div>}
    </div>
  );
}
