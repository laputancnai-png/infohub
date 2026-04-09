import { NextRequest, NextResponse } from 'next/server';
import { fetchYahooQuotes } from '@/lib/scrapers/yahoo';
import { kvSet } from '@/lib/kv';

function isCronAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const quotes = await fetchYahooQuotes();
    await kvSet('finance:quotes', quotes, 20 * 60); // 20min TTL
    return NextResponse.json({ ok: true, count: quotes.length });
  } catch (err) {
    console.error('[cron/finance]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
