import { GlassCard } from '@/components/ui/GlassCard';
import type { AgentSkill } from '@/lib/types';

interface SkillCardProps { skill: AgentSkill }

const SOURCE_STYLE: Record<string, string> = {
  clawhub:  'bg-[#1a1a2e] text-[#a78bfa]',
  skillhub: 'bg-[#0f2027] text-[#34d399]',
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <a href={skill.url} target="_blank" rel="noopener noreferrer" className="no-underline group">
      <GlassCard hover className="p-4 flex flex-col gap-2 h-full">
        {/* header */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ background: skill.source === 'clawhub' ? '#1a1a2e' : '#0f2027',
                     color:      skill.source === 'clawhub' ? '#a78bfa' : '#34d399' }}>
            {skill.source === 'clawhub' ? 'ClawHub' : 'SkillHub'}
          </span>
          <span className="text-[10px] text-[#bbb] shrink-0">#{skill.rank}</span>
        </div>

        {/* name */}
        <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug group-hover:text-[#4d9fff] transition-colors font-mono">
          {skill.name}
        </div>

        {/* description */}
        <div className="text-[11px] text-[#666] dark:text-[#888] leading-relaxed flex-1">
          {skill.descriptionZh ?? skill.description}
        </div>

        {/* footer */}
        <div className="flex items-center gap-3 text-[10px] text-[#aaa] pt-1 border-t border-hairline border-black/[0.06] dark:border-white/[0.06]">
          <span>by {skill.author}</span>
          <span className="ml-auto">↓ {fmt(skill.downloads)}</span>
          {skill.stars > 0 && <span>★ {fmt(skill.stars)}</span>}
        </div>
      </GlassCard>
    </a>
  );
}
