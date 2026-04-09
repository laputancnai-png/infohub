import { NextResponse } from 'next/server';
import { kvGet, kvZrange } from '@/lib/kv';
import type { AdminStats, DonationRecord } from '@/lib/types';
import { isAdminAuthenticated } from '@/lib/auth';

const PAGES = ['/', '/finance'];

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  const totalPvs = await Promise.all(PAGES.map(p => kvGet<number>(`admin:pv:${p}`)));
  const totalPv = totalPvs.reduce((s, v) => s + (v ?? 0), 0);

  const todayPvs = await Promise.all(PAGES.map(p => kvGet<number>(`admin:pv:daily:${today}:${p}`)));
  const todayPv = todayPvs.reduce((s, v) => s + (v ?? 0), 0);

  const daily: AdminStats['daily'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const pvs = await Promise.all(PAGES.map(p => kvGet<number>(`admin:pv:daily:${d}:${p}`)));
    daily.push({ date: d, pv: pvs.reduce((s, v) => s + (v ?? 0), 0) });
  }

  const topPages = PAGES.map((p, i) => ({ page: p, pv: totalPvs[i] ?? 0 }))
    .sort((a, b) => b.pv - a.pv);

  const rawDonations = await kvZrange('admin:donations', 0, 49, true);
  const recentDonations: DonationRecord[] = rawDonations
    .map(s => { try { return JSON.parse(s); } catch { return null; } })
    .filter(Boolean);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const monthDonations = recentDonations.filter(d => d.ts >= monthStart).length;

  const stats: AdminStats = {
    totalPv,
    todayPv,
    totalDonations: rawDonations.length,
    monthDonations,
    daily,
    topPages,
    recentDonations: recentDonations.slice(0, 10),
  };
  return NextResponse.json(stats);
}
