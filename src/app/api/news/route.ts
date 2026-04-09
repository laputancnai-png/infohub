import { NextResponse } from 'next/server';
import { kvGet, MOCK_NEWS } from '@/lib/kv';
import type { NewsItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hn = await kvGet<NewsItem[]>('news:hn');
  return NextResponse.json(hn ?? MOCK_NEWS);
}
