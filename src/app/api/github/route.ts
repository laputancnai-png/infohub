import { NextResponse } from 'next/server';
import { kvGet, MOCK_GITHUB } from '@/lib/kv';
import type { GithubRepo } from '@/lib/types';

export const revalidate = 300;

export async function GET() {
  const data = await kvGet<GithubRepo[]>('github:trending');
  return NextResponse.json(data ?? MOCK_GITHUB);
}
