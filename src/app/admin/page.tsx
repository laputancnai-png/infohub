import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { MetricCard } from '@/components/admin/MetricCard';
import { TrafficChart } from '@/components/admin/TrafficChart';
import { DonateLog } from '@/components/admin/DonateLog';
import type { AdminStats } from '@/lib/types';

async function getStats(): Promise<AdminStats | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/admin/stats`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
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
        <p className="text-[13px] text-white/35 mb-7">Data from Vercel KV</p>

        {!stats && (
          <p className="text-white/30 text-sm mb-6">KV not configured — stats unavailable in local dev without Vercel KV credentials.</p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Total Page Views"  value={stats?.totalPv  ?? 0} />
          <MetricCard label="Today's Views"     value={stats?.todayPv  ?? 0} />
          <MetricCard label="Total Donations"   value={stats?.totalDonations ?? 0} />
          <MetricCard label="This Month"        value={stats?.monthDonations ?? 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-5">
          <div className="bg-surface border border-hairline border-white/[0.08] rounded-xl p-5">
            <h2 className="text-[13px] font-medium text-white/70 mb-4">7-Day Traffic</h2>
            <TrafficChart data={stats?.daily ?? []} />
          </div>
          <div className="bg-surface border border-hairline border-white/[0.08] rounded-xl p-5">
            <h2 className="text-[13px] font-medium text-white/70 mb-4">Top Pages</h2>
            {(stats?.topPages ?? []).map((p) => (
              <div key={p.page} className="flex justify-between py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-[12px] text-white/70">{p.page}</span>
                <span className="text-[12px] text-white/40">{p.pv}</span>
              </div>
            ))}
          </div>
        </div>

        <DonateLog donations={stats?.recentDonations ?? []} />
      </main>
    </div>
  );
}
