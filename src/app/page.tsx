export const dynamic = 'force-dynamic';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Ticker } from '@/components/layout/Ticker';
import { TabBar } from '@/components/home/TabBar';
import { FABWithModal } from '@/components/home/FABWithModal';
import type { GithubRepo, NewsItem, AgentSkill } from '@/lib/types';

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const [reposRes, newsRes, skillsRes] = await Promise.all([
    fetch(`${base}/api/github`, { next: { revalidate: 300 } }),
    fetch(`${base}/api/news`,   { next: { revalidate: 300 } }),
    fetch(`${base}/api/skills`, { next: { revalidate: 300 } }),
  ]);
  const repos: GithubRepo[] = reposRes.ok ? await reposRes.json() : [];
  const news:  NewsItem[]   = newsRes.ok  ? await newsRes.json()  : [];
  const skillsData = skillsRes.ok ? await skillsRes.json() : { skillhub: [], clawhub: [] };
  const skillhubSkills: AgentSkill[] = skillsData.skillhub ?? [];
  const clawhubSkills:  AgentSkill[] = skillsData.clawhub  ?? [];
  return { repos, news, skillhubSkills, clawhubSkills };
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
