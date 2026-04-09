interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  up?: boolean;
}

export function MetricCard({ label, value, delta, up }: MetricCardProps) {
  return (
    <div className="bg-surface border border-hairline border-white/[0.08] rounded-xl px-[18px] py-4">
      <div className="text-[11px] text-white/35 mb-2 tracking-[0.02em]">{label}</div>
      <div className="text-[26px] font-semibold text-[#f5f5f7] tracking-[-0.5px] leading-none mb-1.5">{value}</div>
      {delta && (
        <div className={`text-[11px] font-medium ${up ? 'text-up-muted' : 'text-dn-muted'}`}>{delta}</div>
      )}
    </div>
  );
}
