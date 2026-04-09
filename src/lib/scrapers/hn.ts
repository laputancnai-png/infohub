import type { NewsItem } from '../types';

const HN_API = 'https://hacker-news.firebaseio.com/v0';

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  descendants?: number;
  time: number;
}

export async function fetchHackerNews(limit = 10): Promise<NewsItem[]> {
  // Use beststories to get the highest-scored stories (truly hottest)
  const res = await fetch(`${HN_API}/beststories.json`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error('HN best stories fetch failed');
  const ids: number[] = await res.json();

  // Fetch top 30 candidates in parallel, then sort by score
  const candidates = ids.slice(0, 30);
  const items = await Promise.allSettled(
    candidates.map(id =>
      fetch(`${HN_API}/item/${id}.json`, { next: { revalidate: 0 } })
        .then(r => r.json() as Promise<HNItem>)
    )
  );

  return items
    .filter((r): r is PromiseFulfilledResult<HNItem> => r.status === 'fulfilled' && !!r.value?.title)
    .map(r => r.value)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))  // highest score first
    .slice(0, limit)
    .map(item => ({
      id: String(item.id),
      source: 'hn' as const,
      title: item.title,
      url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
      publishedAt: new Date(item.time * 1000).toISOString(),
      extra: `${item.score ?? 0} points · ${item.descendants ?? 0} comments`,
    }));
}
