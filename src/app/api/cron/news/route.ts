import { NextRequest, NextResponse } from 'next/server';
import { fetchHackerNews } from '@/lib/scrapers/hn';
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
    const hnItems = await fetchHackerNews(10);
    await kvSet('news:hn', hnItems, 45 * 60);
    return NextResponse.json({ ok: true, hn: hnItems.length });
  } catch (err) {
    console.error('[cron/news]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
