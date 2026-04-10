import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { MetricCard } from '@/components/admin/MetricCard';
import { TrafficChart } from '@/components/admin/TrafficChart';
import { DonateLog } from '@/components/admin/DonateLog';
import { kvGet, kvZrange } from '@/lib/kv';
import type { AdminStats, DonationRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

const PAGES = ['/', '/finance'];

async function getStats(): Promise<AdminStats> {
  const today = new Date().toISOString().split('T')[0];

  const totalPvs = await Promise.all(PAGES.map(p => kvGet<number>(`admin:pv:${p}`)));
  const totalPv = totalPvs.reduce((s: number, v) => s + (v ?? 0), 0);

  const todayPvs = await Promise.all(PAGES.map(p => kvGet<number>(`admin:pv:daily:${today}:${p}`)));
  const todayPv = todayPvs.reduce((s: number, v) => s + (v ?? 0), 0);

  const daily: AdminStats['daily'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const pvs = await Promise.all(PAGES.map(p => kvGet<number>(`admin:pv:daily:${d}:${p}`)));
    daily.push({ date: d, pv: pvs.reduce((s: number, v) => s + (v ?? 0), 0) });
  }

  const topPages = PAGES.map((p, i) => ({ page: p, pv: totalPvs[i] ?? 0 }))
    .sort((a, b) => b.pv - a.pv);

  const rawDonations = await kvZrange('admin:donations', 0, 49, true);
  const recentDonations: DonationRecord[] = rawDonations
    .map(s => { try { return JSON.parse(s); } catch { return null; } })
    .filter(Boolean);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const monthDonations = recentDonations.filter(d => d.ts >= monthStart).length;

  return {
    totalPv,
    todayPv,
    totalDonations: rawDonations.length,
    monthDonations,
    daily,
    topPages,
    recentDonations: recentDonations.slice(0, 10),
  };
}

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect('/admin/login');

  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#111113] text-[#f5f5f7]" data-testid="admin-dashboard">
      <nav className="bg-[#1c1c1e] border-b border-hairline border-white/[0.08] px-7 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-medium text-white/70">Laputan Info Hub</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-white/40 tracking-[0.05em]">Admin</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="/" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">← Back to site</a>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Logout</button>
          </form>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto p-7">
        <h1 className="text-[20px] font-semibold mb-1.5 tracking-[-0.3px]">Analytics Overview</h1>
        <p className="text-[13px] text-white/35 mb-7">Data from Redis</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Total Page Views"  value={stats.totalPv} />
          <MetricCard label="Today's Views"     value={stats.todayPv} />
          <MetricCard label="Total Donations"   value={stats.totalDonations} />
          <MetricCard label="This Month"        value={stats.monthDonations} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-5">
          <div className="bg-surface border border-hairline border-white/[0.08] rounded-xl p-5">
            <h2 className="text-[13px] font-medium text-white/70 mb-4">7-Day Traffic</h2>
            <TrafficChart data={stats.daily} />
          </div>
          <div className="bg-surface border border-hairline border-white/[0.08] rounded-xl p-5">
            <h2 className="text-[13px] font-medium text-white/70 mb-4">Top Pages</h2>
            {stats.topPages.map((p) => (
              <div key={p.page} className="flex justify-between py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-[12px] text-white/70">{p.page}</span>
                <span className="text-[12px] text-white/40">{p.pv}</span>
              </div>
            ))}
          </div>
        </div>

        <DonateLog donations={stats.recentDonations} />
      </main>
    </div>
  );
}
