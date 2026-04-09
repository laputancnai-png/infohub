import { NextRequest, NextResponse } from 'next/server';
import { scrapeGithubTrending } from '@/lib/scrapers/github';
import { kvSet } from '@/lib/kv';

function isCronAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // allow in local dev without secret
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const repos = await scrapeGithubTrending();
    await kvSet('github:trending', repos, 3 * 60 * 60); // 3h TTL
    return NextResponse.json({ ok: true, count: repos.length });
  } catch (err) {
    console.error('[cron/github]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
