export const dynamic = 'force-dynamic';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Ticker } from '@/components/layout/Ticker';
import { FABWithModal } from '@/components/home/FABWithModal';
import { FinanceNewsCard } from '@/components/finance/FinanceNewsCard';
import type { NewsItem } from '@/lib/types';

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/news/finance`, { next: { revalidate: 0 } });
  const news: NewsItem[] = res.ok ? await res.json() : [];
  return { news };
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
