'use client';
import { useState } from 'react';

type PayMethod = 'wechat' | 'alipay' | 'paypal' | 'bmc';

interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

async function logDonate(method: PayMethod) {
  await fetch('/api/donate/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method }),
  }).catch(() => {});
}

const EXTERNAL_LINKS: Record<PayMethod, string> = {
  wechat:  '#wechat-qr',
  alipay:  '#alipay-qr',
  paypal:  'https://paypal.me/',
  bmc:     'https://buymeacoffee.com/',
};

export function DonateModal({ open, onClose }: DonateModalProps) {
  const [tab, setTab] = useState<PayMethod>('wechat');

  if (!open) return null;

  const handleExternalClick = async (method: PayMethod) => {
    await logDonate(method);
    const link = EXTERNAL_LINKS[method];
    if (link.startsWith('http')) window.open(link, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-80 rounded-[22px] bg-white/84 dark:bg-[#2c2c2e]/90 backdrop-blur-[32px] border border-hairline border-white/92 dark:border-white/[0.08] p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-black/30 dark:text-white/30 hover:bg-black/5 dark:hover:bg-white/10 text-lg leading-none"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Buy me a coffee ☕</h2>
        <p className="text-sm text-[#888] mb-6">感谢支持 · Thanks for your support</p>

        <div className="flex gap-1.5 mb-5">
          {(['wechat', 'alipay', 'paypal'] as PayMethod[]).map(m => (
            <button
              key={m}
              onClick={() => setTab(m)}
              className={`flex-1 py-2 text-center rounded-xl text-sm font-medium border transition-all ${
                tab === m
                  ? 'bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-[#1d1d1f] border-[#1d1d1f] dark:border-[#f5f5f7]'
                  : 'bg-white/60 dark:bg-white/10 text-[#555] dark:text-[#aaa] border-[#d8d8dc] dark:border-[#3a3a3c]'
              }`}
            >
              {m === 'wechat' ? '微信' : m === 'alipay' ? '支付宝' : 'PayPal'}
            </button>
          ))}
        </div>

        {(tab === 'wechat' || tab === 'alipay') && (
          <div className="flex flex-col items-center gap-3 bg-white rounded-2xl p-5 mb-4">
            <div className="w-36 h-36 bg-[#f5f5f7] rounded-xl flex items-center justify-center text-sm text-[#aaa]">
              QR Code
            </div>
            <p className="text-sm text-[#555] font-medium">扫码打赏 · Scan to donate</p>
            <p className="text-xs text-[#aaa]">金额随意 · Any amount welcome</p>
          </div>
        )}

        {tab === 'paypal' && (
          <div className="flex flex-col gap-2 mb-4">
            <button
              onClick={() => handleExternalClick('paypal')}
              className="flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white text-sm font-medium py-3.5 rounded-xl transition-colors"
            >
              Donate via PayPal
            </button>
            <button
              onClick={() => handleExternalClick('bmc')}
              className="flex items-center justify-center gap-2 bg-[#FFDD00] hover:bg-[#f0d000] text-[#1d1d1f] text-sm font-semibold py-3.5 rounded-xl transition-colors"
            >
              Buy me a coffee
            </button>
          </div>
        )}
        <p className="text-[11px] text-[#ccc] text-center">跳转至安全的第三方支付页面</p>
      </div>
    </div>
  );
}
