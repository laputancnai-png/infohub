import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import type { NewsItem } from '@/lib/types';

interface NewsCardProps { item: NewsItem }

const SOURCE_LABELS: Record<string, string> = { hn: 'Hacker News', '36kr': '36kr', sspai: '少数派' };

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600)  return `${Math.floor(diff / 60)}min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NewsCard({ item }: NewsCardProps) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="no-underline">
      <GlassCard hover className="p-[18px]">
        <div className="flex items-center justify-between mb-2.5">
          <Badge variant={item.source}>{SOURCE_LABELS[item.source]}</Badge>
          <span className="text-[10px] text-[#bbb]">{timeAgo(item.publishedAt)}</span>
        </div>
        <div className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug mb-1.5">{item.title}</div>
        {item.description && (
          <div className="text-[11px] text-[#888] dark:text-[#666] leading-snug line-clamp-2">{item.description}</div>
        )}
        {item.extra && (
          <div className="text-[11px] text-[#888] dark:text-[#666] mt-1">{item.extra}</div>
        )}
      </GlassCard>
    </a>
  );
}
