import { NextResponse } from 'next/server';
import { kvGet } from '@/lib/kv';
import type { NewsItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MOCK_FINANCE_NEWS: NewsItem[] = [
  { id: '1', source: 'marketwatch', title: 'S&P 500 rises as markets stabilize after rate decision', url: 'https://www.marketwatch.com', publishedAt: new Date().toISOString() },
  { id: '2', source: 'ft',          title: 'Fed signals pause in rate hikes amid inflation concerns', url: 'https://www.ft.com', publishedAt: new Date().toISOString() },
  { id: '3', source: 'cnbc',        title: 'Tech stocks lead gains as earnings season kicks off', url: 'https://www.cnbc.com', publishedAt: new Date().toISOString() },
];

export async function GET() {
  const data = await kvGet<NewsItem[]>('news:finance');
  return NextResponse.json(data ?? MOCK_FINANCE_NEWS);
}
