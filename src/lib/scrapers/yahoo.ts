import type { Quote } from '../types';

// ── Stooq symbols for international markets ─────────────────────────────────
const STOOQ_SYMBOLS: Array<{ symbol: string; name: string; nameZh: string; group: Quote['group'] }> = [
  { symbol: '^SPX', name: 'S&P 500',   nameZh: '标普500',  group: 'us' },
  { symbol: '^NDQ', name: 'NASDAQ',    nameZh: '纳斯达克', group: 'us' },
  { symbol: '^DJI', name: 'Dow Jones', nameZh: '道琼斯',   group: 'us' },
  { symbol: '^VIX', name: 'VIX',       nameZh: 'VIX恐慌',  group: 'us' },
  { symbol: '^HSI', name: 'Hang Seng', nameZh: '恒生指数', group: 'hk' },
  { symbol: 'GC.F', name: 'Gold XAU',  nameZh: '黄金',     group: 'commodity' },
  { symbol: 'CL.F', name: 'WTI Oil',   nameZh: 'WTI原油',  group: 'commodity' },
  { symbol: 'BZ.F', name: 'Brent Oil', nameZh: '布伦特油', group: 'commodity' },
  { symbol: 'DX.F', name: 'USD Index', nameZh: '美元指数', group: 'fx' },
  { symbol: 'BTC.V', name: 'Bitcoin',  nameZh: '比特币',   group: 'crypto' },
  { symbol: 'ETH.V', name: 'Ethereum', nameZh: '以太坊',   group: 'crypto' },
];

// ── Tencent Finance for A-share indices (accessible from mainland servers) ───
const TENCENT_SYMBOLS: Array<{ code: string; name: string; nameZh: string; group: Quote['group'] }> = [
  { code: 's_sh000001', name: 'SSE Comp.',  nameZh: '上证综指', group: 'cn' },
  { code: 's_sz399001', name: 'SZSE Comp.', nameZh: '深证成指', group: 'cn' },
];

async function fetchStooqQuote(sym: typeof STOOQ_SYMBOLS[0]): Promise<Quote> {
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(sym.symbol)}&f=sd2t2ohlcvp&h&e=csv`;
  const blank = (): Quote => ({ symbol: sym.symbol, name: sym.name, nameZh: sym.nameZh, value: '—', change: '—', up: true, group: sym.group });
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return blank();
    const text = await res.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) return blank();
    // CSV: Symbol,Date,Time,Open,High,Low,Close,Volume,Prev
    const parts = lines[1].split(',');
    if (parts[6] === 'N/D' || !parts[6]) return blank();
    const close = parseFloat(parts[6]);
    const prev = parseFloat(parts[8]);
    if (!prev || isNaN(close) || isNaN(prev)) return blank();
    const changePct = ((close - prev) / prev) * 100;
    const up = changePct >= 0;
    return {
      symbol: sym.symbol,
      name: sym.name,
      nameZh: sym.nameZh,
      value: formatPrice(close),
      change: `${up ? '+' : ''}${changePct.toFixed(2)}%`,
      up,
      group: sym.group,
    };
  } catch { return blank(); }
}

async function fetchTencentQuotes(): Promise<Quote[]> {
  const codes = TENCENT_SYMBOLS.map(s => s.code).join(',');
  const blank = (s: typeof TENCENT_SYMBOLS[0]): Quote => ({ symbol: s.code, name: s.name, nameZh: s.nameZh, value: '—', change: '—', up: true, group: s.group });
  try {
    const res = await fetch(`https://qt.gtimg.cn/q=${codes}`, { next: { revalidate: 0 } });
    if (!res.ok) return TENCENT_SYMBOLS.map(blank);
    const text = await res.text();
    return TENCENT_SYMBOLS.map(sym => {
      const match = text.match(new RegExp(`v_${sym.code}="[^"]*~([\\d.]+)~([\\d.-]+)~([\\d.-]+)`));
      if (!match) return blank(sym);
      const value = parseFloat(match[1]);
      const changePct = parseFloat(match[3]);
      const up = changePct >= 0;
      return {
        symbol: sym.code,
        name: sym.name,
        nameZh: sym.nameZh,
        value: formatPrice(value),
        change: `${up ? '+' : ''}${changePct.toFixed(2)}%`,
        up,
        group: sym.group,
      };
    });
  } catch { return TENCENT_SYMBOLS.map(blank); }
}

export async function fetchYahooQuotes(): Promise<Quote[]> {
  const [stooqResults, tencentResults] = await Promise.all([
    Promise.all(STOOQ_SYMBOLS.map(fetchStooqQuote)),
    fetchTencentQuotes(),
  ]);

  // Preserve display order: US, HK, CN, Commodity, FX, Crypto
  const all = [...stooqResults, ...tencentResults];
  const order: Quote['group'][] = ['us', 'hk', 'cn', 'commodity', 'fx', 'crypto'];
  return order.flatMap(g => all.filter(q => q.group === g));
}

function formatPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return n.toFixed(2);
}
