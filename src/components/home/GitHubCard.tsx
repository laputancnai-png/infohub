import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import type { GithubRepo } from '@/lib/types';

interface GitHubCardProps { repo: GithubRepo }

export function GitHubCard({ repo }: GitHubCardProps) {
  return (
    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="no-underline">
      <GlassCard hover className="p-[18px]">
        <div className="flex items-start justify-between mb-2.5">
          {repo.language ? <Badge variant={repo.language}>{repo.language}</Badge> : <span />}
          <span className="text-[11px] text-[#999] flex items-center gap-1">
            <span className="text-[#f0a500]">★</span> {repo.stars}
          </span>
        </div>
        <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 tracking-[-0.2px]">
          {repo.owner} / {repo.name}
        </div>
        <div className="text-[12px] text-[#666] dark:text-[#aaa] leading-snug">{repo.description}</div>
        {repo.todayStars && (
          <div className="absolute bottom-3 right-14 text-[11px] text-[#bbb]">+{repo.todayStars}</div>
        )}
        <div className="absolute bottom-3 right-3.5 text-[22px] font-bold text-black/[0.06] dark:text-white/[0.06] tracking-[-1px]">
          {String(repo.rank).padStart(2, '0')}
        </div>
      </GlassCard>
    </a>
  );
}
