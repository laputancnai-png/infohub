'use client';
import { useState } from 'react';
import type { GithubRepo, NewsItem, AgentSkill } from '@/lib/types';
import { GitHubCard } from './GitHubCard';
import { NewsCard } from './NewsCard';
import { SkillCard } from './SkillCard';

type Tab = 'github' | 'hn' | 'skills' | 'ai-bloggers';

interface TabBarProps {
  repos: GithubRepo[];
  news: NewsItem[];
  skillhubSkills: AgentSkill[];
  clawhubSkills: AgentSkill[];
}

interface Blogger {
  name: string;
  desc: string;
  url: string;
}

interface BloggerSection {
  title: string;
  subtitle: string;
  items: Blogger[];
}

const AI_BLOGGER_SECTIONS: BloggerSection[] = [
  {
    title: '一线 Builder',
    subtitle: '直通产品负责人',
    items: [
      { name: 'Kevin Weil', desc: 'OpenAI 产品负责人', url: 'https://www.youtube.com/watch?v=scsW6_2SPC4' },
      { name: 'Christopher Petregal', desc: 'Granola 创始人', url: 'https://www.youtube.com/watch?v=qq3x23MfxkI' },
      { name: 'Nan Yu', desc: 'Linear 产品负责人', url: 'https://www.youtube.com/watch?v=nTr21kgCFF4' },
      { name: 'Raiza Martin', desc: '前 NotebookLM 产品负责人', url: 'https://www.youtube.com/watch?v=sOyFpSW1Vls' },
      { name: 'Josh Woodward', desc: 'Google Labs 与 Gemini 负责人', url: 'https://www.youtube.com/watch?v=3-wVLpHGstQ' },
      { name: 'Amanda Askell', desc: 'Anthropic Claude 性格负责人', url: 'https://www.youtube.com/watch?v=IPmt8b-qLgk' },
    ],
  },
  {
    title: '官方频道',
    subtitle: '最准确的产品发布与技术更新',
    items: [
      { name: 'OpenAI', desc: '官方频道', url: 'https://www.youtube.com/@OpenAI' },
      { name: 'Anthropic', desc: '官方频道', url: 'https://www.youtube.com/@anthropic-ai' },
      { name: 'Google DeepMind: The Podcast', desc: '官方播客', url: 'https://www.youtube.com/watch?v=1O27hf17BaY&list=PLqYmG7hTraZBiUr6_Qf8YTS2Oqy3OGZEj' },
    ],
  },
  {
    title: '顶级访谈播客',
    subtitle: '创投与产品视角',
    items: [
      { name: "Lenny's Podcast", desc: '产品管理顶级播客', url: 'https://www.youtube.com/@LennysPodcast' },
      { name: 'Peter Yang', desc: '前 Instagram 产品经理', url: 'https://www.youtube.com/@PeterYangYT' },
      { name: 'AI and I (by Every)', desc: 'AI 对创业与商业的影响', url: 'https://www.youtube.com/@EveryInc' },
      { name: 'Unsupervised Learning', desc: 'by RedPoint Capital', url: 'https://www.youtube.com/@RedpointAI' },
      { name: 'Training Data', desc: 'by Sequoia Capital · 红杉资本 AI 播客', url: 'https://www.youtube.com/playlist?list=PLOhHNjZItNnMm5tdW61JpnyxeYH5NDDx8' },
      { name: 'Minus One', desc: 'by South Park Commons · 创业者视角', url: 'https://www.youtube.com/watch?v=TmWcsvjJG7E&list=PLmYVYFmFwGm3txxUduawn7i53C5rDjjd7' },
      { name: 'AI+a16z', desc: 'a16z 投资视角', url: 'https://www.youtube.com/watch?v=8Je9HzxYfm8&list=PLM4u6XbiXf5rnUvH5NLdV_It2QLgbHBDZ&index=2' },
      { name: 'No Priors', desc: 'AI 技术讨论', url: 'https://www.youtube.com/watch?v=l8fG5DcjucA&list=PLMKa0PxGwad7jf8hwwX8w5FHitXZ1L_h1' },
      { name: 'Latent Space', desc: '面向 AI 工程师', url: 'https://www.youtube.com/@LatentSpacePod' },
      { name: 'Lex Fridman', desc: 'MIT 研究员长篇深度访谈', url: 'https://www.youtube.com/@lexfridman' },
      { name: 'Dwarkesh Podcast', desc: '高质量技术访谈', url: 'https://www.youtube.com/watch?v=kWcPg8t1kJ4&list=PLd7-bHaQwnthaNDpZ32TtYONGVk95-fhF' },
      { name: 'The AI Daily Brief', desc: 'AI 行业每日资讯', url: 'https://www.youtube.com/@AIDailyBrief' },
      { name: 'Lightcone Podcast (YC)', desc: 'YC 出品，创业与 AI', url: 'https://www.youtube.com/watch?v=ShYKkPPhOoc&list=PLQ-uHSnFig5Ob4XXhgSK26Smb4oRhzFmK' },
    ],
  },
  {
    title: '权威大会演讲',
    subtitle: '把握 AI 发展宏观趋势',
    items: [
      { name: 'YC Startup School', desc: 'YC 创业学校', url: 'https://www.youtube.com/watch?v=BJjsfNO5JTo&list=PLQ-uHSnFig5M9fW16o2l35jrfdsxGknNB' },
      { name: 'AI Engineers World Fair', desc: 'AI 工程师全球盛会', url: 'https://www.youtube.com/watch?v=U-fMsbY-kHY' },
      { name: 'Sequoia AI Ascent', desc: '红杉资本 AI 峰会', url: 'https://www.youtube.com/watch?v=v9JBMnxuPX8&list=PLOhHNjZItNnMEqGLRWkKjaMcdSJptkR08' },
      { name: 'Stripe Sessions', desc: 'Stripe 技术分享', url: 'https://www.youtube.com/watch?v=ONIexChUpuw&list=PLcoWp8pBTM3CYTQho8i-a_lzx4cq7-ePh' },
      { name: 'Figma Config', desc: 'Figma 设计大会', url: 'https://www.youtube.com/watch?v=5q8YAUTYAyk&list=PLXDU_eVOJTx6rKQR1JEIktXodeHUawC_T' },
    ],
  },
  {
    title: '实战教程与技术大师',
    subtitle: 'AI 工具应用 & 深度学习',
    items: [
      { name: 'Riley Brown', desc: 'AI 工具实战教程', url: 'https://www.youtube.com/@rileybrownai' },
      { name: 'Greg Isenberg', desc: '创业者视角的 AI 工具', url: 'https://www.youtube.com/@GregIsenberg' },
      { name: 'Ras Mic', desc: 'AI 工具深度测评', url: 'https://www.youtube.com/@rasmic' },
      { name: 'Mckay Wrigley', desc: 'AI 开发实战', url: 'https://www.youtube.com/@realmckaywrigley' },
      { name: 'Andrej Karpathy', desc: '前 Tesla AI 总监，深度学习权威', url: 'https://www.youtube.com/@AndrejKarpathy' },
    ],
  },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'skills',      label: 'Agent Skills' },
  { id: 'ai-bloggers', label: '最火AI博主' },
  { id: 'github',      label: 'GitHub 热门 / Trending' },
  { id: 'hn',          label: 'Hacker News' },
];

export function TabBar({ repos, news, skillhubSkills, clawhubSkills }: TabBarProps) {
  const [active, setActive] = useState<Tab>('skills');

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

      {/* AI Bloggers */}
      {active === 'ai-bloggers' && (
        <div>
          {/* Summary */}
          <div className="mb-8 p-5 rounded-[16px] bg-gradient-to-br from-[#f0f4ff] to-[#f5f0ff] dark:from-[#1a1a2e] dark:to-[#1e1a2e] border border-[#dde3f5] dark:border-[#2a2a4a]">
            <p className="text-[14px] leading-relaxed text-[#444] dark:text-[#bbb] mb-3">
              厌倦了二手AI信息？本文精选32个YouTube顶级AI博主，涵盖OpenAI、Google DeepMind等官方频道及一线Builder，助你直击AI前沿技术与实战应用。
            </p>
            <p className="text-[13px] leading-relaxed text-[#666] dark:text-[#999]">
              国内很多 AI 信息，是从 Youtube、Reddit 等海外平台层层流转而来的，可能早已被稀释、曲解，甚至完全带偏。学 AI，非常建议到海外一线学习。正如 AI 博主 <span className="font-medium text-[#4d9fff]">@张咋啦</span> 建议：<span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Follow builders, not influencers</span>
            </p>
          </div>

          {/* Sections */}
          {AI_BLOGGER_SECTIONS.map((section) => (
            <section key={section.title} className="mb-8">
              <div className="flex items-baseline gap-2 mb-4">
                <h2 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.3px]">
                  {section.title}
                </h2>
                <span className="text-[12px] text-[#999] dark:text-[#666]">{section.subtitle}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {section.items.map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3.5 rounded-[12px] bg-white dark:bg-[#1c1c1e] border border-black/[0.07] dark:border-white/[0.08] hover:border-[#4d9fff]/40 dark:hover:border-[#4d9fff]/40 hover:shadow-sm transition-all group"
                  >
                    <div className="w-8 h-8 rounded-[8px] bg-red-500/10 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#4d9fff] transition-colors truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#999] dark:text-[#666] mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-[#ccc] dark:text-[#555] flex-shrink-0 mt-1 group-hover:text-[#4d9fff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </section>
          ))}
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
