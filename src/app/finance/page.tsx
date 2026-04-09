import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Ticker } from '@/components/layout/Ticker';
import { FABWithModal } from '@/components/home/FABWithModal';
import { MarketCard } from '@/components/finance/MarketCard';
import { FinanceNewsCard } from '@/components/finance/FinanceNewsCard';
import type { Quote, NewsItem } from '@/lib/types';

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const [quotesRes, newsRes] = await Promise.all([
    fetch(`${base}/api/finance`, { next: { revalidate: 60 } }),
    fetch(`${base}/api/news`,    { next: { revalidate: 300 } }),
  ]);
  const quotes: Quote[]    = quotesRes.ok ? await quotesRes.json() : [];
  const news:   NewsItem[] = newsRes.ok   ? await newsRes.json()   : [];
  return { quotes, news };
}

const GROUP_LABELS: Record<string, string> = {
  us:        '美股 · US Markets',
  hk:        '港股 · Hong Kong',
  cn:        '沪深 · Mainland China',
  commodity: '大宗商品 · Commodities',
  fx:        '外汇 · Forex',
};

export default async function FinancePage() {
  const { quotes, news } = await getData();
  const groups = ['us', 'hk', 'cn', 'commodity', 'fx'] as const;

  return (
    <>
      <Navbar activePage="finance" />
      <Ticker />
      <main className="max-w-[1200px] mx-auto px-8 pt-7 pb-20" data-testid="finance-main">
        {groups.map(g => {
          const gq = quotes.filter(q => q.group === g);
          if (!gq.length) return null;
          return (
            <section key={g} className="mb-8">
              <h3 className="text-[12px] font-medium text-[#999] tracking-[0.08em] uppercase mb-3">
                {GROUP_LABELS[g]}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {gq.map(q => <MarketCard key={q.symbol} quote={q} />)}
              </div>
            </section>
          );
        })}

        <div className="h-px bg-black/[0.07] dark:bg-white/[0.08] my-7" />

        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.3px]">
            财经资讯 · Finance News
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {news.slice(0, 6).map(n => <FinanceNewsCard key={n.id} item={n} />)}
        </div>
      </main>
      <FABWithModal />
      <Footer />
    </>
  );
}
