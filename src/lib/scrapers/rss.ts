import Parser from 'rss-parser';
import type { NewsItem } from '../types';

const parser = new Parser({ timeout: 10000 });

const FINANCE_FEEDS: { url: string; source: NewsItem['source'] }[] = [
  { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'marketwatch' },
  { url: 'https://www.ft.com/rss/home/uk',                             source: 'ft' },
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', source: 'cnbc' },
];

export async function fetchFinanceNews(limitPerFeed = 6): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FINANCE_FEEDS.map(f => fetchOneFeed(f.url, f.source, limitPerFeed))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);
}

async function fetchOneFeed(url: string, source: NewsItem['source'], limit: number): Promise<NewsItem[]> {
  const feed = await parser.parseURL(url);
  return (feed.items ?? []).slice(0, limit).map(item => ({
    id: item.guid ?? item.link ?? String(Math.random()),
    source,
    title: item.title ?? '',
    description: item.contentSnippet ?? item.summary ?? undefined,
    url: item.link ?? '',
    publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
  }));
}
