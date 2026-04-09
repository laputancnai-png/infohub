'use client';
import { useState } from 'react';
import { DonateModal } from '@/components/ui/DonateModal';

export function FABWithModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        data-testid="fab"
        onClick={() => setOpen(true)}
        className="fixed bottom-7 right-7 flex items-center gap-2 bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-[#1d1d1f] text-[14px] font-medium px-[22px] py-[13px] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.2)] z-[200] hover:scale-[1.04] transition-all border-none cursor-pointer"
      >
        ☕ Buy me a coffee
      </button>
      <DonateModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
