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
  const topRes = await fetch(`${HN_API}/topstories.json`, { next: { revalidate: 0 } });
  if (!topRes.ok) throw new Error('HN top stories fetch failed');
  const ids: number[] = await topRes.json();
  const top = ids.slice(0, limit);

  const items = await Promise.allSettled(
    top.map(id =>
      fetch(`${HN_API}/item/${id}.json`, { next: { revalidate: 0 } })
        .then(r => r.json() as Promise<HNItem>)
    )
  );

  return items
    .filter((r): r is PromiseFulfilledResult<HNItem> => r.status === 'fulfilled' && !!r.value?.title)
    .map(r => {
      const item = r.value;
      const points = item.score ?? 0;
      const comments = item.descendants ?? 0;
      return {
        id: String(item.id),
        source: 'hn' as const,
        title: item.title,
        url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
        publishedAt: new Date(item.time * 1000).toISOString(),
        extra: `${points} points · ${comments} comments`,
      };
    });
}
