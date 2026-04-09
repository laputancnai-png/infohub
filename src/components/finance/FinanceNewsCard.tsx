import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import type { NewsItem } from '@/lib/types';

interface FinanceNewsCardProps { item: NewsItem }

const LABELS: Record<string, string> = { hn: 'Hacker News', marketwatch: 'MarketWatch', ft: 'Financial Times', cnbc: 'CNBC' };

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function FinanceNewsCard({ item }: FinanceNewsCardProps) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="no-underline group">
      <GlassCard hover className="p-5 flex flex-col gap-2.5 h-full">
        <div className="flex items-center justify-between">
          <Badge variant={item.source}>{LABELS[item.source] ?? item.source}</Badge>
          <span className="text-[10px] text-[#bbb]">{timeAgo(item.publishedAt)}</span>
        </div>
        <div className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug group-hover:text-[#4d9fff] transition-colors">
          {item.title}
        </div>
        {item.description && (
          <div className="text-[12px] text-[#666] dark:text-[#888] leading-relaxed">
            {item.description}
          </div>
        )}
        <div className="text-[11px] text-[#4d9fff] mt-auto pt-1">
          Read on {LABELS[item.source] ?? item.source} →
        </div>
      </GlassCard>
    </a>
  );
}
