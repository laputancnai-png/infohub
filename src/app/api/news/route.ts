import { NextResponse } from 'next/server';
import { kvGet, MOCK_NEWS } from '@/lib/kv';
import type { NewsItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [hn, kr, sspai] = await Promise.all([
    kvGet<NewsItem[]>('news:hn'),
    kvGet<NewsItem[]>('news:rss:36kr'),
    kvGet<NewsItem[]>('news:rss:sspai'),
  ]);
  const all = [...(hn ?? []), ...(kr ?? []), ...(sspai ?? [])];
  return NextResponse.json(all.length ? all : MOCK_NEWS);
}
