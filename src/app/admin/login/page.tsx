'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('密码错误 · Invalid password');
      }
    } catch {
      setError('网络错误 · Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111113] flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        data-testid="login-form"
        className="bg-[#1c1c1e] border border-hairline border-white/[0.08] rounded-2xl p-10 w-80"
      >
        <h1 className="text-[20px] font-semibold text-[#f5f5f7] mb-1.5 tracking-[-0.3px]">Admin</h1>
        <p className="text-[13px] text-white/35 mb-7">Laputan Info Hub · Dashboard</p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          data-testid="password-input"
          required
          className="w-full bg-white/[0.07] border border-hairline border-white/[0.12] rounded-xl px-4 py-3 text-[14px] text-[#f5f5f7] placeholder-white/25 outline-none focus:border-white/30 mb-3"
        />
        {error && <p className="text-[12px] text-dn mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#f5f5f7] text-[#1d1d1f] text-[14px] font-medium py-3 rounded-xl disabled:opacity-50 hover:bg-white transition-colors"
        >
          {loading ? '...' : '登录 · Login'}
        </button>
      </form>
    </div>
  );
}
