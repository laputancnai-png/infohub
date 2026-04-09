import { NextResponse } from 'next/server';
import { kvGet, MOCK_QUOTES } from '@/lib/kv';
import type { Quote } from '@/lib/types';

export const revalidate = 60;

export async function GET() {
  const data = await kvGet<Quote[]>('finance:quotes');
  return NextResponse.json(data ?? MOCK_QUOTES);
}
