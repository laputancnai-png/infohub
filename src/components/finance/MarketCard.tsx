import type { Quote } from '@/lib/types';

interface MarketCardProps { quote: Quote }

export function MarketCard({ quote }: MarketCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white/80 dark:bg-white/[0.07] backdrop-blur-card border border-hairline border-black/[0.09] dark:border-white/[0.08] shadow-sm dark:shadow-none px-3.5 py-3.5 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/90 before:to-transparent">
      <div className="text-[11px] text-[#999] mb-1.5">{quote.nameZh} · {quote.name}</div>
      <div className="text-[20px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.5px] leading-none mb-1">{quote.value}</div>
      <div className={`text-[12px] font-medium ${quote.up ? 'text-up-muted' : 'text-dn-muted'}`}>{quote.change}</div>
    </div>
  );
}
