import type { GithubRepo, NewsItem, Quote } from './types';

// Redis client — uses ioredis when REDIS_URL is set, no-op stub otherwise
let _redis: import('ioredis').Redis | null = null;

function getRedis() {
  if (!process.env.REDIS_URL) return null;
  if (!_redis) {
    const Redis = require('ioredis');
    _redis = new Redis(process.env.REDIS_URL, { lazyConnect: false, maxRetriesPerRequest: 1 });
  }
  return _redis;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    const val = await r.get(key);
    if (!val) return null;
    return JSON.parse(val) as T;
  } catch { return null; }
}

export async function kvSet(key: string, value: unknown, exSeconds: number): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try { await r.set(key, JSON.stringify(value), 'EX', exSeconds); }
  catch { /* ignore */ }
}

export async function kvIncr(key: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try { await r.incr(key); }
  catch { /* ignore */ }
}

export async function kvExpire(key: string, seconds: number): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try { await r.expire(key, seconds); }
  catch { /* ignore */ }
}

export async function kvZadd(key: string, score: number, member: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try { await r.zadd(key, score, member); }
  catch { /* ignore */ }
}

export async function kvZrange(key: string, start: number, stop: number, rev = false): Promise<string[]> {
  const r = getRedis();
  if (!r) return [];
  try {
    if (rev) return await r.zrevrange(key, start, stop);
    return await r.zrange(key, start, stop);
  } catch { return []; }
}

// ── Mock fixtures (used when Redis is empty or unconfigured) ──────────────────

export const MOCK_GITHUB: GithubRepo[] = [
  { rank: 1, owner: 'microsoft', name: 'autogen', description: 'Multi-agent conversation framework for building LLM applications at scale', language: 'Python', languageColor: '#3572A5', stars: '142.3k', todayStars: '1,234 stars today', url: 'https://github.com/microsoft/autogen' },
  { rank: 2, owner: 'langchain-ai', name: 'langchain', description: 'Build context-aware reasoning applications powered by LLMs', language: 'TypeScript', languageColor: '#2b7489', stars: '98.1k', todayStars: '876 stars today', url: 'https://github.com/langchain-ai/langchain' },
  { rank: 3, owner: 'openai', name: 'openai-python', description: 'The official Python library for the OpenAI API', language: 'Python', languageColor: '#3572A5', stars: '87.4k', todayStars: '654 stars today', url: 'https://github.com/openai/openai-python' },
  { rank: 4, owner: 'vercel', name: 'ai', description: 'Build AI-powered streaming text and chat UIs with React, Svelte, Vue', language: 'TypeScript', languageColor: '#2b7489', stars: '76.2k', todayStars: '543 stars today', url: 'https://github.com/vercel/ai' },
  { rank: 5, owner: 'tauri-apps', name: 'tauri', description: 'Build smaller, faster, and more secure desktop and mobile applications', language: 'Rust', languageColor: '#dea584', stars: '64.8k', todayStars: '432 stars today', url: 'https://github.com/tauri-apps/tauri' },
];

export const MOCK_NEWS: NewsItem[] = [
  { id: '1', source: 'hn', title: 'Show HN: I built a local-first AI assistant that runs entirely offline', description: '432 points · 187 comments', url: 'https://news.ycombinator.com/item?id=1', publishedAt: new Date(Date.now() - 3600000).toISOString(), extra: '432 points · 187 comments' },
  { id: '2', source: 'hn', title: 'Anthropic releases Claude with new computer use capabilities', description: '318 points · 143 comments', url: 'https://news.ycombinator.com/item?id=2', publishedAt: new Date(Date.now() - 7200000).toISOString(), extra: '318 points · 143 comments' },
  { id: '3', source: 'marketwatch', title: 'S&P 500 rises as markets stabilize after rate decision', url: 'https://www.marketwatch.com', publishedAt: new Date(Date.now() - 10800000).toISOString() },
  { id: '4', source: 'ft', title: 'Fed signals pause in rate hikes amid inflation concerns', url: 'https://www.ft.com', publishedAt: new Date(Date.now() - 14400000).toISOString() },
];

export const MOCK_QUOTES: Quote[] = [
  { symbol: '^GSPC',    name: 'S&P 500',   nameZh: '标普500',   value: '5,218.20',  change: '+0.42%', up: true,  group: 'us' },
  { symbol: '^IXIC',    name: 'NASDAQ',    nameZh: '纳斯达克',  value: '16,384.47', change: '−0.18%', up: false, group: 'us' },
  { symbol: '^DJI',     name: 'Dow Jones', nameZh: '道琼斯',    value: '38,904.18', change: '+0.27%', up: true,  group: 'us' },
  { symbol: '^VIX',     name: 'VIX',       nameZh: 'VIX恐慌',   value: '18.24',     change: '−2.31%', up: false, group: 'us' },
  { symbol: '^HSI',     name: 'Hang Seng', nameZh: '恒生指数',  value: '18,202.31', change: '+1.03%', up: true,  group: 'hk' },
  { symbol: '000001.SS',name: 'SSE Comp.', nameZh: '上证综指',  value: '3,241.82',  change: '+0.27%', up: true,  group: 'cn' },
  { symbol: '399001.SZ',name: 'SZSE Comp.',nameZh: '深证成指',  value: '10,124.56', change: '−0.14%', up: false, group: 'cn' },
  { symbol: 'GC=F',     name: 'Gold XAU',  nameZh: '黄金',      value: '2,318.40',  change: '+0.61%', up: true,  group: 'commodity' },
  { symbol: 'CL=F',     name: 'WTI Oil',   nameZh: 'WTI原油',   value: '82.41',     change: '−0.33%', up: false, group: 'commodity' },
  { symbol: 'BZ=F',     name: 'Brent Oil', nameZh: '布伦特油',  value: '65.58',     change: '−0.28%', up: false, group: 'commodity' },
  { symbol: 'DX-Y.NYB', name: 'USD Index', nameZh: '美元指数',  value: '104.22',    change: '−0.09%', up: false, group: 'fx' },
  { symbol: 'BTC-USD',  name: 'Bitcoin',   nameZh: '比特币',    value: '67,482.30', change: '+1.84%', up: true,  group: 'crypto' },
  { symbol: 'ETH-USD',  name: 'Ethereum',  nameZh: '以太坊',    value: '3,124.50',  change: '+0.92%', up: true,  group: 'crypto' },
];
