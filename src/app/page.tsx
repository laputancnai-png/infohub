export const dynamic = 'force-dynamic';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Ticker } from '@/components/layout/Ticker';
import { TabBar } from '@/components/home/TabBar';
import { FABWithModal } from '@/components/home/FABWithModal';
import { kvGet, MOCK_GITHUB, MOCK_NEWS } from '@/lib/kv';
import type { GithubRepo, NewsItem, AgentSkill } from '@/lib/types';

async function getData() {
  const [repos, news, skillhub, clawhub] = await Promise.all([
    kvGet<GithubRepo[]>('github:trending'),
    kvGet<NewsItem[]>('news:hn'),
    kvGet<AgentSkill[]>('skills:skillhub'),
    kvGet<AgentSkill[]>('skills:clawhub'),
  ]);
  return {
    repos:         repos        ?? MOCK_GITHUB,
    news:          news         ?? MOCK_NEWS,
    skillhubSkills: skillhub   ?? [],
    clawhubSkills:  clawhub    ?? [],
  };
}

export default async function HomePage() {
  const { repos, news, skillhubSkills, clawhubSkills } = await getData();
  return (
    <>
      <Navbar activePage="home" />
      <Ticker />
      <main className="max-w-[1200px] mx-auto px-8 pt-7 pb-20">
        <TabBar repos={repos} news={news} skillhubSkills={skillhubSkills} clawhubSkills={clawhubSkills} />
      </main>
      <FABWithModal />
      <Footer />
    </>
  );
}
