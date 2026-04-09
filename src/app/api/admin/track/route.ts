import { NextRequest, NextResponse } from 'next/server';
import { kvIncr, kvExpire } from '@/lib/kv';

export async function POST(req: NextRequest) {
  const { page } = await req.json().catch(() => ({ page: '/' }));
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `admin:pv:daily:${today}:${page}`;
  await Promise.all([
    kvIncr(`admin:pv:${page}`),
    kvIncr(dailyKey),
    kvExpire(dailyKey, 60 * 60 * 24 * 90),
  ]);
  return NextResponse.json({ ok: true });
}
