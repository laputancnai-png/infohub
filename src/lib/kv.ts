import type { GithubRepo, NewsItem, Quote, DonationRecord } from './types';

// Re-export kv only when configured; otherwise export a no-op stub
// so the app works locally without Vercel KV credentials.
let _kv: typeof import('@vercel/kv').kv | null = null;

function getKv() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  if (!_kv) {
    // Dynamic require to avoid module-load errors when env vars are missing
    _kv = require('@vercel/kv').kv;
  }
  return _kv;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const kv = getKv();
  if (!kv) return null;
  try { return await kv.get<T>(key); }
  catch { return null; }
}

export async function kvSet(key: string, value: unknown, exSeconds: number): Promise<void> {
  const kv = getKv();
  if (!kv) return;
  try { await kv.set(key, value, { ex: exSeconds }); }
  catch { /* ignore */ }
}

export async function kvIncr(key: string): Promise<void> {
  const kv = getKv();
  if (!kv) return;
  try { await kv.incr(key); }
  catch { /* ignore */ }
}

export async function kvExpire(key: string, seconds: number): Promise<void> {
  const kv = getKv();
  if (!kv) return;
  try { await kv.expire(key, seconds); }
  catch { /* ignore */ }
}

export async function kvZadd(key: string, score: number, member: string): Promise<void> {
  const kv = getKv();
  if (!kv) return;
  try { await kv.zadd(key, { score, member }); }
  catch { /* ignore */ }
}

export async function kvZrange(key: string, start: number, stop: number, rev = false): Promise<string[]> {
  const kv = getKv();
  if (!kv) return [];
  try {
    const opts = rev ? { rev: true } : {};
    return (await kv.zrange(key, start, stop, opts)) as string[];
  }
  catch { return []; }
}

// ── Mock fixtures (used when KV is empty or unconfigured) ──────────────────

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
  { id: '3', source: '36kr', title: '字节跳动发布豆包 1.5 Pro，多模态能力对标 GPT-4o', description: '在代码生成、数学推理方面取得显著提升，价格较前代下降 60%', url: 'https://36kr.com', publishedAt: new Date(Date.now() - 10800000).toISOString() },
  { id: '4', source: 'sspai', title: '用 AI 重新定义工作流：2025 年最值得关注的效率工具', description: '少数派编辑部精选了 12 款改变工作方式的工具', url: 'https://sspai.com', publishedAt: new Date(Date.now() - 14400000).toISOString() },
];

export const MOCK_QUOTES: Quote[] = [
  { symbol: '^GSPC',    name: 'S&P 500',   nameZh: '标普500',   value: '5,218.20',  change: '+0.42%', up: true,  group: 'us' },
  { symbol: '^IXIC',    name: 'NASDAQ',    nameZh: '纳斯达克',  value: '16,384.47', change: '−0.18%', up: false, group: 'us' },
  { symbol: '^DJI',     name: 'Dow Jones', nameZh: '道琼斯',    value: '38,904.18', change: '+0.27%', up: true,  group: 'us' },
  { symbol: '^HSI',     name: 'Hang Seng', nameZh: '恒生指数',  value: '18,202.31', change: '+1.03%', up: true,  group: 'hk' },
  { symbol: '000001.SS',name: 'SSE Comp.', nameZh: '上证综指',  value: '3,241.82',  change: '+0.27%', up: true,  group: 'cn' },
  { symbol: '399001.SZ',name: 'SZSE Comp.',nameZh: '深证成指',  value: '10,124.56', change: '−0.14%', up: false, group: 'cn' },
  { symbol: 'GC=F',     name: 'Gold XAU',  nameZh: '黄金',      value: '2,318.40',  change: '+0.61%', up: true,  group: 'commodity' },
  { symbol: 'CL=F',     name: 'WTI Oil',   nameZh: 'WTI原油',   value: '82.41',     change: '−0.33%', up: false, group: 'commodity' },
  { symbol: 'DX-Y.NYB', name: 'USD Index', nameZh: '美元指数',  value: '104.22',    change: '−0.09%', up: false, group: 'fx' },
];
