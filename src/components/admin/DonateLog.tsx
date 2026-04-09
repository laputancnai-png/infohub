import type { DonationRecord } from '@/lib/types';

interface DonateLogProps { donations: DonationRecord[] }

const METHOD_LABELS: Record<string, string> = {
  wechat: '微信', alipay: '支付宝', paypal: 'PayPal', bmc: 'Buy me a coffee',
};

const METHOD_CLS: Record<string, string> = {
  wechat: 'bg-[rgba(7,193,96,0.15)] text-[#1aad64]',
  alipay: 'bg-[rgba(0,160,233,0.15)] text-[#4daaee]',
  paypal: 'bg-[rgba(0,112,186,0.15)] text-[#4d9fff]',
  bmc:    'bg-[rgba(255,221,0,0.15)] text-[#c9a800]',
};

export function DonateLog({ donations }: DonateLogProps) {
  return (
    <div className="bg-surface border border-hairline border-white/[0.08] rounded-xl overflow-hidden">
      <div className="grid grid-cols-[1fr_120px] gap-2 px-4 py-2.5 border-b border-white/[0.06]">
        <span className="text-[10px] text-white/28 font-medium tracking-[0.06em] uppercase">Time</span>
        <span className="text-[10px] text-white/28 font-medium tracking-[0.06em] uppercase">Method</span>
      </div>
      {donations.length === 0 && (
        <p className="text-center text-sm text-white/20 py-8">暂无捐赠记录</p>
      )}
      {donations.map((d, i) => (
        <div key={i} className="grid grid-cols-[1fr_120px] gap-2 px-4 py-2.5 border-b border-white/[0.04] last:border-b-0 items-center">
          <span className="text-[12px] text-white/50">{new Date(d.ts).toLocaleString()}</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${METHOD_CLS[d.method] ?? ''}`}>
            {METHOD_LABELS[d.method]}
          </span>
        </div>
      ))}
    </div>
  );
}
