import type { Quote } from '../types';

interface SymbolConfig {
  symbol: string;
  name: string;
  nameZh: string;
  group: Quote['group'];
}

const SYMBOLS: SymbolConfig[] = [
  { symbol: '^GSPC', name: 'S&P 500', nameZh: '标普500', group: 'us' },
  { symbol: '^IXIC', name: 'NASDAQ', nameZh: '纳斯达克', group: 'us' },
  { symbol: '^DJI', name: 'Dow Jones', nameZh: '道琼斯', group: 'us' },
  { symbol: '^HSI', name: 'Hang Seng', nameZh: '恒生指数', group: 'hk' },
  { symbol: '000001.SS', name: 'SSE Comp.', nameZh: '上证综指', group: 'cn' },
  { symbol: '399001.SZ', name: 'SZSE Comp.', nameZh: '深证成指', group: 'cn' },
  { symbol: 'GC=F', name: 'Gold XAU', nameZh: '黄金', group: 'commodity' },
  { symbol: 'CL=F', name: 'WTI Oil', nameZh: 'WTI原油', group: 'commodity' },
  { symbol: 'DX-Y.NYB', name: 'USD Index', nameZh: '美元指数', group: 'fx' },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://finance.yahoo.com',
  'Referer': 'https://finance.yahoo.com/',
};

export async function fetchYahooQuotes(): Promise<Quote[]> {
  const symbolStr = SYMBOLS.map(s => encodeURIComponent(s.symbol)).join('%2C');

  // Try v8 API first (cookie-free)
  const url = `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${symbolStr}&fields=regularMarketPrice,regularMarketChangePercent,shortName&formatted=false`;

  let res = await fetch(url, { headers: HEADERS, next: { revalidate: 0 } });

  // Fallback to v7 if v8 fails
  if (!res.ok) {
    const urlV7 = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}&fields=regularMarketPrice,regularMarketChangePercent,shortName`;
    res = await fetch(urlV7, { headers: HEADERS, next: { revalidate: 0 } });
  }

  if (!res.ok) throw new Error(`Yahoo Finance fetch failed: ${res.status}`);

  const data = (await res.json()) as Record<string, unknown>;
  const results: Record<string, unknown>[] =
    ((data.quoteResponse as Record<string, unknown>)?.result as Record<string, unknown>[]) ?? [];

  return SYMBOLS.map(cfg => {
    const r = results.find((q: Record<string, unknown>) => q.symbol === cfg.symbol);
    if (!r) {
      return { symbol: cfg.symbol, name: cfg.name, nameZh: cfg.nameZh, value: '—', change: '—', up: true, group: cfg.group };
    }
    const price = (r.regularMarketPrice as number) ?? 0;
    const changePct = (r.regularMarketChangePercent as number) ?? 0;
    const up = changePct >= 0;
    return {
      symbol: cfg.symbol,
      name: cfg.name,
      nameZh: cfg.nameZh,
      value: formatPrice(price),
      change: `${up ? '+' : ''}${changePct.toFixed(2)}%`,
      up,
      group: cfg.group,
    };
  });
}

function formatPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return n.toFixed(2);
}
