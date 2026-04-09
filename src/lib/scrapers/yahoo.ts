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

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Cache crumb + cookie for the process lifetime (refreshed on 401)
let _crumb: string | null = null;
let _cookie: string | null = null;

async function fetchCrumb(): Promise<{ crumb: string; cookie: string }> {
  // Step 1: get essential cookies (only A1, A3, A1S, cmp, euconsent)
  const consentRes = await fetch('https://finance.yahoo.com/quote/%5EGSPC/', {
    headers: { 'User-Agent': UA, 'Accept': 'text/html' },
    redirect: 'follow',
  });

  // Extract only key=value from each Set-Cookie, limit to first 5 cookies to avoid overflow
  const rawCookies: string[] = [];
  consentRes.headers.forEach((value, name) => {
    if (name.toLowerCase() === 'set-cookie') {
      const kv = value.split(';')[0].trim();
      if (kv) rawCookies.push(kv);
    }
  });
  const cookie = rawCookies.slice(0, 5).join('; ');

  // Step 2: get crumb
  const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, 'Cookie': cookie },
  });
  const crumb = await crumbRes.text();
  if (!crumb || crumb.includes('<')) throw new Error('Failed to get Yahoo crumb');
  return { crumb: crumb.trim(), cookie };
}

export async function fetchYahooQuotes(): Promise<Quote[]> {
  // Fetch crumb if not cached
  if (!_crumb || !_cookie) {
    const result = await fetchCrumb();
    _crumb = result.crumb;
    _cookie = result.cookie;
  }

  const symbolStr = SYMBOLS.map(s => encodeURIComponent(s.symbol)).join('%2C');
  const url = `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${symbolStr}&crumb=${encodeURIComponent(_crumb)}&fields=regularMarketPrice,regularMarketChangePercent&formatted=false`;

  let res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Cookie': _cookie, 'Accept': 'application/json' },
    next: { revalidate: 0 },
  });

  // If 401, refresh crumb and retry once
  if (res.status === 401) {
    _crumb = null;
    _cookie = null;
    const result = await fetchCrumb();
    _crumb = result.crumb;
    _cookie = result.cookie;
    const retryUrl = `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${symbolStr}&crumb=${encodeURIComponent(_crumb)}&fields=regularMarketPrice,regularMarketChangePercent&formatted=false`;
    res = await fetch(retryUrl, {
      headers: { 'User-Agent': UA, 'Cookie': _cookie, 'Accept': 'application/json' },
      next: { revalidate: 0 },
    });
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
