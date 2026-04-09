import type { Quote } from '../types';
import https from 'https';
import { IncomingMessage } from 'http';

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

// Use Node.js https module to bypass undici's header overflow limitation
function httpsGet(url: string, headers: Record<string, string>): Promise<{ body: string; cookies: string[] }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': UA, ...headers },
      timeout: 15000,
    };
    const req = https.get(options, (res: IncomingMessage) => {
      const cookies: string[] = [];
      const raw = res.rawHeaders;
      for (let i = 0; i < raw.length - 1; i += 2) {
        if (raw[i].toLowerCase() === 'set-cookie') cookies.push(raw[i + 1]);
      }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve({ body: Buffer.concat(chunks).toString(), cookies }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

let _crumb: string | null = null;
let _cookie: string | null = null;

async function refreshCrumb(): Promise<void> {
  const { cookies } = await httpsGet('https://finance.yahoo.com/quote/%5EGSPC/', {});
  // Take only first 6 key=value pairs to keep cookie header small
  const cookie = cookies.slice(0, 6).map(c => c.split(';')[0].trim()).join('; ');

  const { body } = await httpsGet('https://query1.finance.yahoo.com/v1/test/getcrumb', { Cookie: cookie });
  if (!body || body.includes('<') || body.length > 50) throw new Error('Failed to get Yahoo crumb');
  _crumb = body.trim();
  _cookie = cookie;
}

export async function fetchYahooQuotes(): Promise<Quote[]> {
  if (!_crumb || !_cookie) await refreshCrumb();

  const symbolStr = SYMBOLS.map(s => encodeURIComponent(s.symbol)).join('%2C');
  const url = `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${symbolStr}&crumb=${encodeURIComponent(_crumb!)}&fields=regularMarketPrice,regularMarketChangePercent&formatted=false`;

  let { body } = await httpsGet(url, { Cookie: _cookie!, Accept: 'application/json' });

  // If response looks like an auth error, refresh and retry
  if (body.includes('"code":"Too Many Requests"') || body.includes('"error"')) {
    _crumb = null;
    _cookie = null;
    await refreshCrumb();
    const retry = await httpsGet(
      `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${symbolStr}&crumb=${encodeURIComponent(_crumb!)}&fields=regularMarketPrice,regularMarketChangePercent&formatted=false`,
      { Cookie: _cookie!, Accept: 'application/json' }
    );
    body = retry.body;
  }

  const data = JSON.parse(body) as Record<string, unknown>;
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
