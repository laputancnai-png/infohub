'use client';
import { useState } from 'react';
import { DonateModal } from '@/components/ui/DonateModal';

export function Footer() {
  const [open, setOpen] = useState(false);
  const btnCls = 'text-[12px] font-medium px-4 py-1.5 rounded-full border border-hairline border-[#d0d0d5] dark:border-[#3a3a3c] text-[#555] dark:text-[#aaa] bg-white/80 dark:bg-[#2c2c2e]/80 hover:bg-[#1d1d1f] dark:hover:bg-[#f5f5f7] hover:text-white dark:hover:text-[#1d1d1f] hover:border-[#1d1d1f] dark:hover:border-[#f5f5f7] transition-all';

  return (
    <>
      <footer className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-card border-t border-hairline border-black/[0.08] dark:border-white/[0.08] px-8 py-6 flex items-center justify-between flex-wrap gap-3.5">
        <div className="text-[12px] text-[#999] leading-relaxed">
          <div className="font-medium text-[#555] dark:text-[#aaa] mb-0.5">Laputan Info Hub · news.36techsolutions.com</div>
          <div>
            Developed by Laputan YAO &nbsp;·&nbsp;
            <a href="https://github.com/laputancnai-png" className="text-[#4d9fff] no-underline">GitHub</a>
            &nbsp;·&nbsp; laputancnai@gmail.com
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#aaa] mr-1">支持作者 / Support</span>
          <button onClick={() => setOpen(true)} className={btnCls}>微信</button>
          <button onClick={() => setOpen(true)} className={btnCls}>支付宝</button>
          <button onClick={() => setOpen(true)} className={btnCls}>PayPal</button>
        </div>
      </footer>
      <DonateModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
