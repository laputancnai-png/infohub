import { NextResponse } from 'next/server';
import { kvGet } from '@/lib/kv';
import type { AgentSkill } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [skillhub, clawhub] = await Promise.all([
    kvGet<AgentSkill[]>('skills:skillhub'),
    kvGet<AgentSkill[]>('skills:clawhub'),
  ]);
  return NextResponse.json({
    skillhub: skillhub ?? [],
    clawhub: clawhub ?? [],
  });
}
