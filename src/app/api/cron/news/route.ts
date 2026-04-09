import { NextRequest, NextResponse } from 'next/server';
import { fetchHackerNews } from '@/lib/scrapers/hn';
import { fetchRssFeeds } from '@/lib/scrapers/rss';
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
    const [hnItems, rssItems] = await Promise.all([
      fetchHackerNews(10),
      fetchRssFeeds(6),
    ]);
    const hn36kr = rssItems.filter(i => i.source === '36kr');
    const sspai  = rssItems.filter(i => i.source === 'sspai');

    await Promise.all([
      kvSet('news:hn',        hnItems,  45 * 60),
      kvSet('news:rss:36kr',  hn36kr,   45 * 60),
      kvSet('news:rss:sspai', sspai,    45 * 60),
    ]);
    return NextResponse.json({ ok: true, hn: hnItems.length, '36kr': hn36kr.length, sspai: sspai.length });
  } catch (err) {
    console.error('[cron/news]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
