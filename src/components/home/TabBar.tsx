'use client';
import { useState } from 'react';
import type { GithubRepo, NewsItem } from '@/lib/types';
import { GitHubCard } from './GitHubCard';
import { NewsCard } from './NewsCard';

type Tab = 'github' | 'hn';

interface TabBarProps {
  repos: GithubRepo[];
  news: NewsItem[];
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'github', label: 'GitHub 热门 / Trending' },
  { id: 'hn',     label: 'Hacker News' },
];

export function TabBar({ repos, news }: TabBarProps) {
  const [active, setActive] = useState<Tab>('github');

  const tabCls = (id: Tab) =>
    `text-[13px] px-4 py-1.5 rounded-full border transition-all ${
      active === id
        ? 'bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-[#1d1d1f] border-[#1d1d1f] dark:border-[#f5f5f7]'
        : 'bg-white dark:bg-[#2c2c2e] border-[#d0d0d5] dark:border-[#3a3a3c] text-[#555] dark:text-[#aaa]'
    }`;

  const filteredNews = active === 'github' ? [] : news.filter(n => n.source === active);

  return (
    <>
      <div className="flex gap-1.5 mb-6 flex-wrap" role="tablist">
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={active === t.id} onClick={() => setActive(t.id)} className={tabCls(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

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

      {active !== 'github' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" data-testid="news-grid">
          {filteredNews.length ? (
            filteredNews.map(n => <NewsCard key={n.id} item={n} />)
          ) : (
            <p className="col-span-2 text-sm text-[#aaa] text-center py-12">暂无数据 · No data</p>
          )}
        </div>
      )}
    </>
  );
}
