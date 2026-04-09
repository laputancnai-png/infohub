export const dynamic = 'force-dynamic';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Ticker } from '@/components/layout/Ticker';
import { FABWithModal } from '@/components/home/FABWithModal';
import { FinanceNewsCard } from '@/components/finance/FinanceNewsCard';
import { kvGet } from '@/lib/kv';
import type { NewsItem } from '@/lib/types';

const MOCK_FINANCE_NEWS: NewsItem[] = [
  { id: '1', source: 'marketwatch', title: 'S&P 500 rises as markets stabilize', url: 'https://www.marketwatch.com', publishedAt: new Date().toISOString() },
  { id: '2', source: 'ft',          title: 'Fed signals pause in rate hikes',    url: 'https://www.ft.com',         publishedAt: new Date().toISOString() },
  { id: '3', source: 'cnbc',        title: 'Tech stocks lead gains',             url: 'https://www.cnbc.com',       publishedAt: new Date().toISOString() },
];

async function getData() {
  const news = await kvGet<NewsItem[]>('news:finance');
  return { news: news ?? MOCK_FINANCE_NEWS };
}

const SOURCE_LABELS: Record<string, string> = {
  marketwatch: 'MarketWatch',
  ft:          'Financial Times',
  cnbc:        'CNBC',
};

export default async function FinancePage() {
  const { news } = await getData();

  // Group by source for display
  const sources = ['marketwatch', 'ft', 'cnbc'] as const;

  return (
    <>
      <Navbar activePage="finance" />
      <Ticker />
      <main className="max-w-[1200px] mx-auto px-8 pt-7 pb-20" data-testid="finance-main">
        {sources.map(src => {
          const items = news.filter(n => n.source === src);
          if (!items.length) return null;
          return (
            <section key={src} className="mb-10">
              <h3 className="text-[12px] font-medium text-[#999] tracking-[0.08em] uppercase mb-3">
                {SOURCE_LABELS[src]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {items.map(n => <FinanceNewsCard key={n.id} item={n} />)}
              </div>
            </section>
          );
        })}
      </main>
      <FABWithModal />
      <Footer />
    </>
  );
}
