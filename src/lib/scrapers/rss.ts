import Parser from 'rss-parser';
import type { NewsItem } from '../types';

const parser = new Parser({ timeout: 8000 });

const FEEDS: { url: string; source: NewsItem['source'] }[] = [
  { url: 'https://36kr.com/feed', source: '36kr' },
  { url: 'https://sspai.com/feed', source: 'sspai' },
];

export async function fetchRssFeeds(limitPerFeed = 6): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(feed => fetchOneFeed(feed.url, feed.source, limitPerFeed))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);
}

async function fetchOneFeed(
  url: string,
  source: NewsItem['source'],
  limit: number
): Promise<NewsItem[]> {
  const feed = await parser.parseURL(url);
  return (feed.items ?? []).slice(0, limit).map(item => ({
    id: item.guid ?? item.link ?? item.title ?? String(Math.random()),
    source,
    title: item.title ?? '',
    description: item.contentSnippet ?? item.summary ?? undefined,
    url: item.link ?? '',
    publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
  }));
}
