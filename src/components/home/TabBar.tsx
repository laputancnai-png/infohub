'use client';
import { useState } from 'react';
import type { GithubRepo, NewsItem, AgentSkill } from '@/lib/types';
import { GitHubCard } from './GitHubCard';
import { NewsCard } from './NewsCard';
import { SkillCard } from './SkillCard';

type Tab = 'github' | 'hn' | 'skills';

interface TabBarProps {
  repos: GithubRepo[];
  news: NewsItem[];
  skillhubSkills: AgentSkill[];
  clawhubSkills: AgentSkill[];
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'github', label: 'GitHub 热门 / Trending' },
  { id: 'hn',     label: 'Hacker News' },
  { id: 'skills', label: 'Agent Skills' },
];

export function TabBar({ repos, news, skillhubSkills, clawhubSkills }: TabBarProps) {
  const [active, setActive] = useState<Tab>('github');

  const tabCls = (id: Tab) =>
    `text-[13px] px-4 py-1.5 rounded-full border transition-all ${
      active === id
        ? 'bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-[#1d1d1f] border-[#1d1d1f] dark:border-[#f5f5f7]'
        : 'bg-white dark:bg-[#2c2c2e] border-[#d0d0d5] dark:border-[#3a3a3c] text-[#555] dark:text-[#aaa]'
    }`;

  return (
    <>
      <div className="flex gap-1.5 mb-6 flex-wrap" role="tablist">
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={active === t.id}
            onClick={() => setActive(t.id)} className={tabCls(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* GitHub Trending */}
      {active === 'github' && (
        <>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.3px]">
              GitHub 最热项目 · Top Stars
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-7" data-testid="github-grid">
            {repos.slice(0, 5).map(r => <GitHubCard key={r.url} repo={r} />)}
            <a href="https://github.com/trending" target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center min-h-[100px] rounded-[14px] bg-black/[0.025] dark:bg-white/[0.04] border border-hairline border-black/[0.07] dark:border-white/[0.08] text-[13px] text-[#aaa] hover:bg-black/[0.05] dark:hover:bg-white/[0.07] hover:text-[#888] transition-all cursor-pointer">
              查看全部 20 个项目 →
            </a>
          </div>
        </>
      )}

      {/* Hacker News */}
      {active === 'hn' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" data-testid="news-grid">
          {news.filter(n => n.source === 'hn').length ? (
            news.filter(n => n.source === 'hn').map(n => <NewsCard key={n.id} item={n} />)
          ) : (
            <p className="col-span-2 text-sm text-[#aaa] text-center py-12">暂无数据 · No data</p>
          )}
        </div>
      )}

      {/* Agent Skills */}
      {active === 'skills' && (
        <>
          {skillhubSkills.length > 0 && (
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.3px]">
                  SkillHub 热门 · Top Downloads
                </h2>
                <a href="https://skillhub.cn" target="_blank" rel="noopener noreferrer"
                   className="text-[12px] text-[#4d9fff]">skillhub.cn →</a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {skillhubSkills.map(s => <SkillCard key={`sh-${s.rank}`} skill={s} />)}
              </div>
            </section>
          )}

          {clawhubSkills.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.3px]">
                  ClawHub 热门 · Top Downloads
                </h2>
                <a href="https://clawhub.ai" target="_blank" rel="noopener noreferrer"
                   className="text-[12px] text-[#4d9fff]">clawhub.ai →</a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {clawhubSkills.map(s => <SkillCard key={`ch-${s.rank}`} skill={s} />)}
              </div>
            </section>
          )}

          {!skillhubSkills.length && !clawhubSkills.length && (
            <p className="text-sm text-[#aaa] text-center py-12">暂无数据 · No data</p>
          )}
        </>
      )}
    </>
  );
}
