import { NextRequest, NextResponse } from 'next/server';
import { fetchSkillHubSkills, fetchClawHubSkills } from '@/lib/scrapers/skills';
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
    const [skillhub, clawhub] = await Promise.all([
      fetchSkillHubSkills(20),
      fetchClawHubSkills(20),
    ]);
    await Promise.all([
      kvSet('skills:skillhub', skillhub, 4 * 60 * 60),  // 4h TTL
      kvSet('skills:clawhub',  clawhub,  4 * 60 * 60),
    ]);
    return NextResponse.json({ ok: true, skillhub: skillhub.length, clawhub: clawhub.length });
  } catch (err) {
    console.error('[cron/skills]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
