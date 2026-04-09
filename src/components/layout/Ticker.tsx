'use client';
import { useEffect, useState } from 'react';
import type { Quote } from '@/lib/types';

export function Ticker() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    fetch('/api/finance')
      .then(r => r.json())
      .then(setQuotes)
      .catch(() => {});
  }, []);

  if (!quotes.length) return <div className="bg-void h-[34px]" />;

  const items = [...quotes, ...quotes];

  return (
    <div className="bg-void overflow-hidden h-[34px] flex items-center" data-testid="ticker">
      <span className="w-2 h-2 rounded-full bg-up animate-pulse-dot flex-shrink-0 mx-3.5" />
      <div className="flex animate-ticker whitespace-nowrap">
        {items.map((q, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-6 text-[12px] font-mono">
            <span className="text-white/40">{q.nameZh}</span>
            <span className="text-white/85 font-medium">{q.value}</span>
            <span className={q.up ? 'text-up' : 'text-dn'}>{q.change}</span>
            <span className="text-white/10 px-1">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
