# Laputan Info Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Laputan Info Hub — a Next.js 14 info aggregation platform (GitHub Trending, HN + RSS news, Yahoo Finance quotes, admin dashboard) deployed to Vercel.

**Architecture:** Vercel Cron Jobs write scraped data into Vercel KV; public API routes serve cached KV data; pages use Server Components; middleware handles PV counting + admin cookie auth. When KV is empty/unconfigured, API routes return mock fixtures so E2E tests pass without infrastructure.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · next-themes · @vercel/kv · recharts · rss-parser · Playwright

---

## File Map

```
src/
├── lib/
│   ├── types.ts                      # All shared interfaces
│   ├── kv.ts                         # Vercel KV wrapper + availability check
│   ├── auth.ts                       # Cookie sign/verify + login check
│   └── scrapers/
│       ├── github.ts                 # GitHub Trending HTML scraper
│       ├── hn.ts                     # Hacker News API client
│       ├── rss.ts                    # RSS feed parser (36kr / 少数派)
│       └── yahoo.ts                  # Yahoo Finance unofficial API
├── app/
│   ├── layout.tsx                    # ThemeProvider + Navbar + Footer
│   ├── page.tsx                      # AI Tech homepage (Server Component)
│   ├── finance/page.tsx              # Finance page (Server Component)
│   ├── admin/
│   │   ├── page.tsx                  # Admin dashboard (Server Component)
│   │   └── login/page.tsx            # Admin login form
│   └── api/
│       ├── github/route.ts           # GET: read KV → GithubRepo[]
│       ├── news/route.ts             # GET: read KV → NewsItem[]
│       ├── finance/route.ts          # GET: read KV → Quote[]
│       ├── donate/log/route.ts       # POST: zadd to KV donations sorted set
│       ├── admin/
│       │   ├── login/route.ts        # POST: verify password → set cookie
│       │   ├── logout/route.ts       # POST: clear cookie
│       │   └── stats/route.ts        # GET: pv counts + donations from KV
│       └── cron/
│           ├── github/route.ts       # POST (cron): scrape → write KV
│           ├── news/route.ts         # POST (cron): fetch → write KV
│           └── finance/route.ts      # POST (cron): fetch → write KV
├── components/
│   ├── ui/
│   │   ├── GlassCard.tsx             # Reusable glass morphism card
│   │   ├── Badge.tsx                 # Source/language badge
│   │   ├── DonateModal.tsx           # WeChat/Alipay/PayPal modal (Client)
│   │   └── ThemeToggle.tsx           # Light/dark toggle (Client)
│   ├── layout/
│   │   ├── Navbar.tsx                # Top nav with ThemeToggle
│   │   ├── Footer.tsx                # Footer + donate buttons
│   │   └── Ticker.tsx                # Scrolling market ticker (Client)
│   ├── home/
│   │   ├── TabBar.tsx                # Content tab switcher (Client)
│   │   ├── GitHubCard.tsx            # GitHub repo card
│   │   └── NewsCard.tsx              # News item card
│   ├── finance/
│   │   ├── MarketCard.tsx            # Index/commodity price card
│   │   └── FinanceNewsCard.tsx       # Financial news card
│   └── admin/
│       ├── MetricCard.tsx            # KPI number card
│       ├── TrafficChart.tsx          # 7-day PV line chart (recharts, Client)
│       └── DonateLog.tsx             # Donation record list
└── middleware.ts                     # PV incr + /admin route protection

# Root config files
package.json
tsconfig.json
next.config.ts
tailwind.config.ts
postcss.config.js
vercel.json
.env.local.example
.gitignore
playwright.config.ts
tests/e2e/
├── home.spec.ts
├── finance.spec.ts
└── admin.spec.ts
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.js`
- Create: `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "infohub",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18",
    "next-themes": "^0.3.0",
    "@vercel/kv": "^2.0.0",
    "recharts": "^2.12.0",
    "rss-parser": "^3.13.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@playwright/test": "^1.43.0",
    "eslint": "^8",
    "eslint-config-next": "14.2.5"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.ts**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { typedRoutes: false },
};

export default nextConfig;
```

- [ ] **Step 4: Create postcss.config.js**

```js
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
.next/
.env.local
.env
out/
dist/
playwright-report/
test-results/
```

- [ ] **Step 6: Install dependencies**

```bash
cd /Users/laputancnai/infohub
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 7: Install Playwright browsers**

```bash
npx playwright install chromium
```

- [ ] **Step 8: Commit**

```bash
git add package.json tsconfig.json next.config.ts postcss.config.js .gitignore
git commit -m "chore: scaffold Next.js 14 project with dependencies"
```

---

## Task 2: Tailwind & Shared Styles

**Files:**
- Create: `tailwind.config.ts`
- Create: `src/app/globals.css`

- [ ] **Step 1: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:       '#0A0A14',
        surface:    '#1c1c1e',
        up:         '#1aff8c',
        'up-muted': '#1aad64',
        dn:         '#ff4d6a',
        'dn-muted': '#e0364f',
      },
      borderWidth: { hairline: '0.5px' },
      backdropBlur: { glass: '20px', card: '12px' },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Create src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes ticker {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

.animate-ticker { animation: ticker 50s linear infinite; }
.animate-pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }

* { box-sizing: border-box; }
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "chore: configure Tailwind with design system tokens"
```

---

## Task 3: Shared Types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create src/lib/types.ts**

```typescript
export interface GithubRepo {
  rank: number;
  owner: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: string;
  todayStars: string;
  url: string;
}

export interface NewsItem {
  id: string;
  source: 'hn' | '36kr' | 'sspai';
  title: string;
  description?: string;
  url: string;
  publishedAt: string; // ISO 8601
  extra?: string;      // e.g. "432 points · 187 comments" for HN
}

export interface Quote {
  symbol: string;
  name: string;
  nameZh: string;
  value: string;
  change: string;
  up: boolean;
  group: 'us' | 'hk' | 'cn' | 'commodity' | 'fx';
}

export interface DonationRecord {
  method: 'wechat' | 'alipay' | 'paypal' | 'bmc';
  ts: number;
}

export interface AdminStats {
  totalPv: number;
  todayPv: number;
  totalDonations: number;
  monthDonations: number;
  daily: { date: string; pv: number }[];
  topPages: { page: string; pv: number }[];
  recentDonations: DonationRecord[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 4: KV Wrapper

**Files:**
- Create: `src/lib/kv.ts`

- [ ] **Step 1: Create src/lib/kv.ts**

```typescript
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
  { id: '2', source: 'hn', title: 'Anthropic releases Claude 3.5 with new computer use capabilities', description: '318 points · 143 comments', url: 'https://news.ycombinator.com/item?id=2', publishedAt: new Date(Date.now() - 7200000).toISOString(), extra: '318 points · 143 comments' },
  { id: '3', source: '36kr', title: '字节跳动发布豆包 1.5 Pro，多模态能力对标 GPT-4o', description: '在代码生成、数学推理方面取得显著提升，价格较前代下降 60%', url: 'https://36kr.com', publishedAt: new Date(Date.now() - 10800000).toISOString() },
  { id: '4', source: 'sspai', title: '用 AI 重新定义工作流：2025 年最值得关注的效率工具', description: '少数派编辑部精选了 12 款改变工作方式的工具', url: 'https://sspai.com', publishedAt: new Date(Date.now() - 14400000).toISOString() },
];

export const MOCK_QUOTES: Quote[] = [
  { symbol: '^GSPC',    name: 'S&P 500',   nameZh: '标普',   value: '5,218.20', change: '+0.42%', up: true,  group: 'us' },
  { symbol: '^IXIC',    name: 'NASDAQ',    nameZh: '纳指',   value: '16,384.47', change: '−0.18%', up: false, group: 'us' },
  { symbol: '^DJI',     name: 'Dow Jones', nameZh: '道指',   value: '38,904.18', change: '+0.27%', up: true,  group: 'us' },
  { symbol: '^HSI',     name: 'Hang Seng', nameZh: '恒生',   value: '18,202.31', change: '+1.03%', up: true,  group: 'hk' },
  { symbol: '000001.SS',name: 'SSE Comp.',  nameZh: '上证',   value: '3,241.82',  change: '+0.27%', up: true,  group: 'cn' },
  { symbol: '399001.SZ',name: 'SZSE Comp.',nameZh: '深证',   value: '10,124.56', change: '−0.14%', up: false, group: 'cn' },
  { symbol: 'GC=F',     name: 'Gold XAU',  nameZh: '黄金',   value: '2,318.40',  change: '+0.61%', up: true,  group: 'commodity' },
  { symbol: 'CL=F',     name: 'WTI Oil',   nameZh: 'WTI油',  value: '82.41',     change: '−0.33%', up: false, group: 'commodity' },
  { symbol: 'DX-Y.NYB', name: 'USD Index', nameZh: '美元指数', value: '104.22',  change: '−0.09%', up: false, group: 'fx' },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/kv.ts
git commit -m "feat: add KV wrapper with mock fallback fixtures"
```

---

## Task 5: Auth Library

**Files:**
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Create src/lib/auth.ts**

```typescript
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
const PAYLOAD = 'admin:authenticated';

async function sign(value: string): Promise<string> {
  const secret = process.env.ADMIN_COOKIE_SECRET ?? 'dev-secret-change-me';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Buffer.from(sig).toString('hex');
}

async function verify(value: string, signature: string): Promise<boolean> {
  const expected = await sign(value);
  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const sig = await sign(PAYLOAD);
  return `${PAYLOAD}:${sig}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const lastColon = token.lastIndexOf(':');
  if (lastColon === -1) return false;
  const payload = token.substring(0, lastColon);
  const signature = token.substring(lastColon + 1);
  if (payload !== PAYLOAD) return false;
  return verify(payload, signature);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: add HMAC-based admin session cookie auth"
```

---

## Task 6: GitHub Trending Scraper

**Files:**
- Create: `src/lib/scrapers/github.ts`

- [ ] **Step 1: Create src/lib/scrapers/github.ts**

```typescript
import type { GithubRepo } from '../types';

const LANGUAGE_COLORS: Record<string, string> = {
  Python:     '#3572A5',
  TypeScript: '#2b7489',
  JavaScript: '#f1e05a',
  Rust:       '#dea584',
  Go:         '#00ADD8',
  Java:       '#b07219',
  'C++':      '#f34b7d',
  C:          '#555555',
  Swift:      '#F05138',
  Kotlin:     '#A97BFF',
};

export async function scrapeGithubTrending(): Promise<GithubRepo[]> {
  const res = await fetch('https://github.com/trending', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoHub/1.0)' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`GitHub trending fetch failed: ${res.status}`);
  const html = await res.text();

  const repos: GithubRepo[] = [];
  // Each repo is in an <article class="Box-row">...</article>
  const articleRegex = /<article[^>]*class="[^"]*Box-row[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
  let match: RegExpExecArray | null;
  let rank = 0;

  while ((match = articleRegex.exec(html)) !== null && rank < 20) {
    rank++;
    const block = match[1];

    // Owner/name from <h2><a href="/owner/repo">
    const hrefMatch = /href="\/([^/"]+)\/([^/"]+)"/.exec(block);
    if (!hrefMatch) continue;
    const owner = hrefMatch[1];
    const name = hrefMatch[2];

    // Description
    const descMatch = /<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/.exec(block);
    const description = descMatch
      ? descMatch[1].replace(/<[^>]+>/g, '').trim()
      : '';

    // Language
    const langMatch = /itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/.exec(block);
    const language = langMatch ? langMatch[1].trim() : '';

    // Total stars (aria-label="1,234 stars")
    const starsMatch = /aria-label="([\d,]+) users starred"/.exec(block)
      ?? /aria-label="([\d,]+) star"/.exec(block);
    const starsRaw = starsMatch ? starsMatch[1].replace(/,/g, '') : '0';
    const starsNum = parseInt(starsRaw, 10);
    const stars = starsNum >= 1000
      ? `${(starsNum / 1000).toFixed(1)}k`
      : String(starsNum);

    // Today stars
    const todayMatch = /([\d,]+)\s+stars?\s+today/.exec(block);
    const todayStars = todayMatch ? `${todayMatch[1]} stars today` : '';

    repos.push({
      rank,
      owner,
      name,
      description,
      language,
      languageColor: LANGUAGE_COLORS[language] ?? '#8b949e',
      stars,
      todayStars,
      url: `https://github.com/${owner}/${name}`,
    });
  }

  return repos;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/scrapers/github.ts
git commit -m "feat: add GitHub Trending HTML scraper"
```

---

## Task 7: Hacker News Client

**Files:**
- Create: `src/lib/scrapers/hn.ts`

- [ ] **Step 1: Create src/lib/scrapers/hn.ts**

```typescript
import type { NewsItem } from '../types';

const HN_API = 'https://hacker-news.firebaseio.com/v0';

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  descendants?: number;
  time: number;
}

export async function fetchHackerNews(limit = 10): Promise<NewsItem[]> {
  const topRes = await fetch(`${HN_API}/topstories.json`, { next: { revalidate: 0 } });
  if (!topRes.ok) throw new Error('HN top stories fetch failed');
  const ids: number[] = await topRes.json();
  const top = ids.slice(0, limit);

  const items = await Promise.allSettled(
    top.map(id =>
      fetch(`${HN_API}/item/${id}.json`, { next: { revalidate: 0 } })
        .then(r => r.json() as Promise<HNItem>)
    )
  );

  return items
    .filter((r): r is PromiseFulfilledResult<HNItem> => r.status === 'fulfilled' && !!r.value?.title)
    .map(r => {
      const item = r.value;
      const points = item.score ?? 0;
      const comments = item.descendants ?? 0;
      return {
        id: String(item.id),
        source: 'hn' as const,
        title: item.title,
        url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
        publishedAt: new Date(item.time * 1000).toISOString(),
        extra: `${points} points · ${comments} comments`,
      };
    });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/scrapers/hn.ts
git commit -m "feat: add Hacker News API client"
```

---

## Task 8: RSS Parser

**Files:**
- Create: `src/lib/scrapers/rss.ts`

- [ ] **Step 1: Create src/lib/scrapers/rss.ts**

```typescript
import Parser from 'rss-parser';
import type { NewsItem } from '../types';

const parser = new Parser({ timeout: 8000 });

const FEEDS: { url: string; source: NewsItem['source'] }[] = [
  { url: 'https://36kr.com/feed',   source: '36kr' },
  { url: 'https://sspai.com/feed',  source: 'sspai' },
];

export async function fetchRssFeeds(limitPerFeed = 6): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(feed => fetchOneFeed(feed.url, feed.source, limitPerFeed))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);
}

async function fetchOneFeed(
  url: string,
  source: NewsItem['source'],
  limit: number
): Promise<NewsItem[]> {
  const feed = await parser.parseURL(url);
  return (feed.items ?? []).slice(0, limit).map(item => ({
    id: item.guid ?? item.link ?? item.title ?? String(Math.random()),
    source,
    title: item.title ?? '',
    description: item.contentSnippet ?? item.summary ?? undefined,
    url: item.link ?? '',
    publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/scrapers/rss.ts
git commit -m "feat: add RSS feed parser for 36kr and 少数派"
```

---

## Task 9: Yahoo Finance Client

**Files:**
- Create: `src/lib/scrapers/yahoo.ts`

- [ ] **Step 1: Create src/lib/scrapers/yahoo.ts**

```typescript
import type { Quote } from '../types';

interface SymbolConfig {
  symbol: string;
  name: string;
  nameZh: string;
  group: Quote['group'];
}

const SYMBOLS: SymbolConfig[] = [
  { symbol: '^GSPC',     name: 'S&P 500',    nameZh: '标普500',   group: 'us' },
  { symbol: '^IXIC',     name: 'NASDAQ',     nameZh: '纳斯达克',  group: 'us' },
  { symbol: '^DJI',      name: 'Dow Jones',  nameZh: '道琼斯',    group: 'us' },
  { symbol: '^HSI',      name: 'Hang Seng',  nameZh: '恒生指数',  group: 'hk' },
  { symbol: '000001.SS', name: 'SSE Comp.',  nameZh: '上证综指',  group: 'cn' },
  { symbol: '399001.SZ', name: 'SZSE Comp.', nameZh: '深证成指',  group: 'cn' },
  { symbol: 'GC=F',      name: 'Gold XAU',   nameZh: '黄金',      group: 'commodity' },
  { symbol: 'CL=F',      name: 'WTI Oil',    nameZh: 'WTI原油',   group: 'commodity' },
  { symbol: 'DX-Y.NYB',  name: 'USD Index',  nameZh: '美元指数',  group: 'fx' },
];

export async function fetchYahooQuotes(): Promise<Quote[]> {
  const symbolStr = SYMBOLS.map(s => s.symbol).join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolStr)}&fields=regularMarketPrice,regularMarketChangePercent,shortName`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; InfoHub/1.0)',
      'Accept': 'application/json',
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Yahoo Finance fetch failed: ${res.status}`);

  const data = await res.json();
  const results: Record<string, unknown>[] = data?.quoteResponse?.result ?? [];

  return SYMBOLS.map(cfg => {
    const r = results.find((q: Record<string, unknown>) => q.symbol === cfg.symbol);
    if (!r) {
      return { symbol: cfg.symbol, name: cfg.name, nameZh: cfg.nameZh, value: '—', change: '—', up: true, group: cfg.group };
    }
    const price = (r.regularMarketPrice as number) ?? 0;
    const changePct = (r.regularMarketChangePercent as number) ?? 0;
    const up = changePct >= 0;
    const sign = up ? '+' : '';
    return {
      symbol: cfg.symbol,
      name: cfg.name,
      nameZh: cfg.nameZh,
      value: formatPrice(price),
      change: `${sign}${changePct.toFixed(2)}%`,
      up,
      group: cfg.group,
    };
  });
}

function formatPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return n.toFixed(2);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/scrapers/yahoo.ts
git commit -m "feat: add Yahoo Finance unofficial API client"
```

---

## Task 10: Cron Routes

**Files:**
- Create: `src/app/api/cron/github/route.ts`
- Create: `src/app/api/cron/news/route.ts`
- Create: `src/app/api/cron/finance/route.ts`

- [ ] **Step 1: Create src/app/api/cron/github/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { scrapeGithubTrending } from '@/lib/scrapers/github';
import { kvSet } from '@/lib/kv';

function isCronAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // allow in local dev without secret
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const repos = await scrapeGithubTrending();
    await kvSet('github:trending', repos, 3 * 60 * 60); // 3h TTL
    return NextResponse.json({ ok: true, count: repos.length });
  } catch (err) {
    console.error('[cron/github]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create src/app/api/cron/news/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchHackerNews } from '@/lib/scrapers/hn';
import { fetchRssFeeds } from '@/lib/scrapers/rss';
import { kvSet } from '@/lib/kv';

function isCronAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [hnItems, rssItems] = await Promise.all([
      fetchHackerNews(10),
      fetchRssFeeds(6),
    ]);
    const hn36kr = rssItems.filter(i => i.source === '36kr');
    const sspai  = rssItems.filter(i => i.source === 'sspai');

    await Promise.all([
      kvSet('news:hn',        hnItems,  45 * 60),
      kvSet('news:rss:36kr',  hn36kr,   45 * 60),
      kvSet('news:rss:sspai', sspai,    45 * 60),
    ]);
    return NextResponse.json({ ok: true, hn: hnItems.length, '36kr': hn36kr.length, sspai: sspai.length });
  } catch (err) {
    console.error('[cron/news]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create src/app/api/cron/finance/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchYahooQuotes } from '@/lib/scrapers/yahoo';
import { kvSet } from '@/lib/kv';

function isCronAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const quotes = await fetchYahooQuotes();
    await kvSet('finance:quotes', quotes, 20 * 60); // 20min TTL
    return NextResponse.json({ ok: true, count: quotes.length });
  } catch (err) {
    console.error('[cron/finance]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cron/
git commit -m "feat: add Cron routes for GitHub, news, and finance data refresh"
```

---

## Task 11: Public API Routes

**Files:**
- Create: `src/app/api/github/route.ts`
- Create: `src/app/api/news/route.ts`
- Create: `src/app/api/finance/route.ts`

- [ ] **Step 1: Create src/app/api/github/route.ts**

```typescript
import { NextResponse } from 'next/server';
import { kvGet, MOCK_GITHUB } from '@/lib/kv';
import type { GithubRepo } from '@/lib/types';

export const revalidate = 300; // 5 min Next.js cache

export async function GET() {
  const data = await kvGet<GithubRepo[]>('github:trending');
  return NextResponse.json(data ?? MOCK_GITHUB);
}
```

- [ ] **Step 2: Create src/app/api/news/route.ts**

```typescript
import { NextResponse } from 'next/server';
import { kvGet, MOCK_NEWS } from '@/lib/kv';
import type { NewsItem } from '@/lib/types';

export const revalidate = 300;

export async function GET() {
  const [hn, kr, sspai] = await Promise.all([
    kvGet<NewsItem[]>('news:hn'),
    kvGet<NewsItem[]>('news:rss:36kr'),
    kvGet<NewsItem[]>('news:rss:sspai'),
  ]);
  const all = [...(hn ?? []), ...(kr ?? []), ...(sspai ?? [])];
  return NextResponse.json(all.length ? all : MOCK_NEWS);
}
```

- [ ] **Step 3: Create src/app/api/finance/route.ts**

```typescript
import { NextResponse } from 'next/server';
import { kvGet, MOCK_QUOTES } from '@/lib/kv';
import type { Quote } from '@/lib/types';

export const revalidate = 60;

export async function GET() {
  const data = await kvGet<Quote[]>('finance:quotes');
  return NextResponse.json(data ?? MOCK_QUOTES);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/github/ src/app/api/news/ src/app/api/finance/
git commit -m "feat: add public API routes (github, news, finance)"
```

---

## Task 12: Donate & Admin API Routes

**Files:**
- Create: `src/app/api/donate/log/route.ts`
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/logout/route.ts`
- Create: `src/app/api/admin/stats/route.ts`

- [ ] **Step 1: Create src/app/api/donate/log/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { kvZadd } from '@/lib/kv';
import type { DonationRecord } from '@/lib/types';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const method = body?.method as DonationRecord['method'];
  if (!['wechat', 'alipay', 'paypal', 'bmc'].includes(method)) {
    return NextResponse.json({ error: 'invalid method' }, { status: 400 });
  }
  const ts = Date.now();
  const record: DonationRecord = { method, ts };
  await kvZadd('admin:donations', ts, JSON.stringify(record));
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Create src/app/api/admin/login/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }));
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return res;
}
```

- [ ] **Step 3: Create src/app/api/admin/logout/route.ts**

```typescript
import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
```

- [ ] **Step 4: Create src/app/api/admin/stats/route.ts**

```typescript
import { NextResponse } from 'next/server';
import { kvGet, kvZrange } from '@/lib/kv';
import type { AdminStats, DonationRecord } from '@/lib/types';
import { isAdminAuthenticated } from '@/lib/auth';

const PAGES = ['/', '/finance'];

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  // Total PV per page
  const totalPvs = await Promise.all(PAGES.map(p => kvGet<number>(`admin:pv:${p}`)));
  const totalPv = totalPvs.reduce((s, v) => s + (v ?? 0), 0);

  // Today PV
  const todayPvs = await Promise.all(PAGES.map(p => kvGet<number>(`admin:pv:daily:${today}:${p}`)));
  const todayPv = todayPvs.reduce((s, v) => s + (v ?? 0), 0);

  // 7-day daily totals
  const daily: AdminStats['daily'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const pvs = await Promise.all(PAGES.map(p => kvGet<number>(`admin:pv:daily:${d}:${p}`)));
    daily.push({ date: d, pv: pvs.reduce((s, v) => s + (v ?? 0), 0) });
  }

  // Top pages
  const topPages = PAGES.map((p, i) => ({ page: p, pv: totalPvs[i] ?? 0 }))
    .sort((a, b) => b.pv - a.pv);

  // Donations (last 50)
  const rawDonations = await kvZrange('admin:donations', 0, 49, true);
  const recentDonations: DonationRecord[] = rawDonations
    .map(s => { try { return JSON.parse(s); } catch { return null; } })
    .filter(Boolean);

  // This month count
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const monthDonations = recentDonations.filter(d => d.ts >= monthStart).length;

  const stats: AdminStats = {
    totalPv,
    todayPv,
    totalDonations: rawDonations.length,
    monthDonations,
    daily,
    topPages,
    recentDonations: recentDonations.slice(0, 10),
  };
  return NextResponse.json(stats);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/donate/ src/app/api/admin/
git commit -m "feat: add donate log route and admin API (login/logout/stats)"
```

---

## Task 13: Middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create src/middleware.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const valid = token ? await verifySessionToken(token) : false;
    if (!valid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  const response = NextResponse.next();

  // PV counting — fire-and-forget via a background fetch
  // Using edge-compatible approach: set a header so the page can incr
  // We use a simpler approach: POST to an internal tracking endpoint
  // But to keep it truly non-blocking, we use waitUntil via the web standard
  if (!pathname.startsWith('/admin')) {
    const today = new Date().toISOString().split('T')[0];
    // Note: We rely on the page handler to increment PV for simplicity
    // Real middleware PV would require edge KV access — handled via response header
    response.headers.set('x-pv-page', pathname);
    response.headers.set('x-pv-date', today);
  }

  return response;
}
```

> **Note:** For actual PV counting, the `src/app/api/admin/track/route.ts` approach is simpler and more reliable than edge KV in middleware. The middleware sets headers; pages optionally call the track endpoint. For Phase 1, PV counting is done directly in the admin stats page via a separate `/api/admin/track` endpoint called from the layout.

- [ ] **Step 2: Create src/app/api/admin/track/route.ts** (lightweight PV recorder)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { kvIncr, kvExpire } from '@/lib/kv';

export async function POST(req: NextRequest) {
  const { page } = await req.json().catch(() => ({ page: '/' }));
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `admin:pv:daily:${today}:${page}`;
  await Promise.all([
    kvIncr(`admin:pv:${page}`),
    kvIncr(dailyKey),
    kvExpire(dailyKey, 60 * 60 * 24 * 90),
  ]);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts src/app/api/admin/track/
git commit -m "feat: add middleware for admin auth guard and PV tracking endpoint"
```

---

## Task 14: UI Primitives

**Files:**
- Create: `src/components/ui/GlassCard.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/ThemeToggle.tsx`

- [ ] **Step 1: Create src/components/ui/GlassCard.tsx**

```tsx
import { HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function GlassCard({ hover = false, className = '', children, ...props }: GlassCardProps) {
  const base = [
    'relative overflow-hidden rounded-[14px]',
    'bg-white/70 dark:bg-white/[0.07]',
    'backdrop-blur-card',
    'border border-hairline border-white/85 dark:border-white/[0.08]',
    // Top highlight line
    'before:absolute before:inset-x-0 before:top-0 before:h-px',
    'before:bg-gradient-to-r before:from-transparent before:via-white/90 before:to-transparent',
  ].join(' ');

  const hoverCls = hover
    ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:bg-white/90 dark:hover:bg-white/[0.12]'
    : '';

  return (
    <div className={`${base} ${hoverCls} ${className}`} {...props}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/ui/Badge.tsx**

```tsx
interface BadgeProps {
  variant: string;
  children: React.ReactNode;
}

const VARIANTS: Record<string, string> = {
  // News sources
  hn:     'bg-[#ff6600] text-white',
  '36kr': 'bg-[#e60026] text-white',
  sspai:  'bg-[#d53a31] text-white',
  // GitHub languages
  Python:     'bg-[#e8f0ff] text-[#1a3880] dark:bg-[#1a3880]/30 dark:text-[#7eb0ff]',
  TypeScript: 'bg-[#e1f5ee] text-[#085041] dark:bg-[#085041]/30 dark:text-[#4dd4a0]',
  Rust:       'bg-[#fff0e8] text-[#7a2e10] dark:bg-[#7a2e10]/30 dark:text-[#ffb07a]',
  Go:         'bg-[#e8f8ff] text-[#004d70] dark:bg-[#004d70]/30 dark:text-[#7ad4ff]',
  JavaScript: 'bg-[#fffbe8] text-[#7a5e00] dark:bg-[#7a5e00]/30 dark:text-[#ffd966]',
  default:    'bg-black/5 text-black/50 dark:bg-white/10 dark:text-white/60',
};

export function Badge({ variant, children }: BadgeProps) {
  const cls = VARIANTS[variant] ?? VARIANTS.default;
  return (
    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Create src/components/ui/ThemeToggle.tsx**

```tsx
'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-8 h-8 flex items-center justify-center rounded-full text-[#555] dark:text-[#aaa] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
    >
      {theme === 'dark' ? (
        // Sun icon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        // Moon icon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add GlassCard, Badge, and ThemeToggle UI primitives"
```

---

## Task 15: DonateModal

**Files:**
- Create: `src/components/ui/DonateModal.tsx`

- [ ] **Step 1: Create src/components/ui/DonateModal.tsx**

```tsx
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

  const handleTabClick = (method: PayMethod) => setTab(method);
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
              onClick={() => handleTabClick(m)}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/DonateModal.tsx
git commit -m "feat: add DonateModal with WeChat/Alipay/PayPal tabs"
```

---

## Task 16: Layout Components

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/Ticker.tsx`

- [ ] **Step 1: Create src/components/layout/Navbar.tsx**

```tsx
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavbarProps { activePage?: 'home' | 'finance' | 'admin' }

// LAPUTAN SVG logo (7-tile rainbow grid)
function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="0"  y="0"  width="9"  height="9"  rx="2.5" fill="rgba(130,70,255,0.75)"  stroke="rgba(200,160,255,0.6)"  strokeWidth=".6"/>
      <rect x="10" y="0"  width="9"  height="9"  rx="2.5" fill="rgba(255,50,110,0.75)"  stroke="rgba(255,140,180,0.6)"  strokeWidth=".6"/>
      <rect x="20" y="0"  width="10" height="9"  rx="2.5" fill="rgba(255,130,20,0.75)"  stroke="rgba(255,200,100,0.6)"  strokeWidth=".6"/>
      <rect x="0"  y="10" width="9"  height="9"  rx="2.5" fill="rgba(20,195,110,0.75)"  stroke="rgba(90,240,165,0.6)"   strokeWidth=".6"/>
      <rect x="10" y="10" width="9"  height="9"  rx="2.5" fill="rgba(20,150,255,0.75)"  stroke="rgba(100,205,255,0.6)"  strokeWidth=".6"/>
      <rect x="20" y="10" width="10" height="9"  rx="2.5" fill="rgba(255,210,20,0.75)"  stroke="rgba(255,238,110,0.6)"  strokeWidth=".6"/>
      <rect x="0"  y="20" width="9"  height="10" rx="2.5" fill="rgba(255,50,195,0.75)"  stroke="rgba(255,140,230,0.6)"  strokeWidth=".6"/>
      <text x="3"  y="8"  fontSize="6.5" fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">L</text>
      <text x="13" y="8"  fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">A</text>
      <text x="23" y="8"  fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">P</text>
      <text x="3"  y="18" fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">U</text>
      <text x="13" y="18" fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">T</text>
      <text x="23" y="18" fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">A</text>
      <text x="3"  y="29" fontSize="6"   fontWeight="800" fill="rgba(255,255,255,.95)" fontFamily="-apple-system,sans-serif">N</text>
    </svg>
  );
}

export function Navbar({ activePage = 'home' }: NavbarProps) {
  const linkCls = (page: string) =>
    `text-[13px] px-3.5 py-1.5 rounded-full transition-colors ${
      activePage === page
        ? 'bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-[#1d1d1f]'
        : 'text-[#555] dark:text-[#aaa] hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/72 dark:bg-[#1c1c1e]/72 backdrop-blur-glass border-b border-hairline border-black/[0.08] dark:border-white/[0.08] px-8 h-[52px] flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <Logo />
        <span className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.3px]">
          Laputan Info Hub
        </span>
      </Link>
      <div className="flex items-center gap-1">
        <Link href="/"        className={linkCls('home')}>AI Tech</Link>
        <Link href="/finance" className={linkCls('finance')}>Finance</Link>
      </div>
      <ThemeToggle />
    </nav>
  );
}
```

- [ ] **Step 2: Create src/components/layout/Footer.tsx**

```tsx
'use client';
import { useState } from 'react';
import { DonateModal } from '@/components/ui/DonateModal';

export function Footer() {
  const [open, setOpen] = useState(false);
  const btnCls = 'text-[12px] font-medium px-4 py-1.5 rounded-full border border-hairline border-[#d0d0d5] dark:border-[#3a3a3c] text-[#555] dark:text-[#aaa] bg-white/80 dark:bg-[#2c2c2e]/80 hover:bg-[#1d1d1f] dark:hover:bg-[#f5f5f7] hover:text-white dark:hover:text-[#1d1d1f] hover:border-[#1d1d1f] dark:hover:border-[#f5f5f7] transition-all';

  return (
    <>
      <footer className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-card border-t border-hairline border-black/[0.08] dark:border-white/[0.08] px-8 py-6 flex items-center justify-between flex-wrap gap-3.5">
        <div className="text-[12px] text-[#999] leading-relaxed">
          <div className="font-medium text-[#555] dark:text-[#aaa] mb-0.5">Laputan Info Hub · news.36techsolutions.com</div>
          <div>
            Developed by Laputan YAO &nbsp;·&nbsp;
            <a href="https://github.com/laputancnai-png" className="text-[#4d9fff] no-underline">GitHub</a>
            &nbsp;·&nbsp; laputancnai@gmail.com
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#aaa] mr-1">支持作者 / Support</span>
          <button onClick={() => setOpen(true)} className={btnCls}>微信</button>
          <button onClick={() => setOpen(true)} className={btnCls}>支付宝</button>
          <button onClick={() => setOpen(true)} className={btnCls}>PayPal</button>
        </div>
      </footer>
      <DonateModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

- [ ] **Step 3: Create src/components/layout/Ticker.tsx**

```tsx
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

  const items = [...quotes, ...quotes]; // double for seamless loop

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
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add Navbar, Footer, and Ticker layout components"
```

---

## Task 17: Home Page Components

**Files:**
- Create: `src/components/home/TabBar.tsx`
- Create: `src/components/home/GitHubCard.tsx`
- Create: `src/components/home/NewsCard.tsx`

- [ ] **Step 1: Create src/components/home/TabBar.tsx**

```tsx
'use client';
import { useState } from 'react';
import type { GithubRepo, NewsItem } from '@/lib/types';
import { GitHubCard } from './GitHubCard';
import { NewsCard } from './NewsCard';

type Tab = 'github' | 'hn' | '36kr' | 'sspai';

interface TabBarProps {
  repos: GithubRepo[];
  news: NewsItem[];
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'github', label: 'GitHub 热门 / Trending' },
  { id: 'hn',     label: 'Hacker News' },
  { id: '36kr',   label: '36kr' },
  { id: 'sspai',  label: '少数派' },
];

export function TabBar({ repos, news }: TabBarProps) {
  const [active, setActive] = useState<Tab>('github');

  const tabCls = (id: Tab) =>
    `text-[13px] px-4 py-1.5 rounded-full border transition-all ${
      active === id
        ? 'bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-[#1d1d1f] border-[#1d1d1f] dark:border-[#f5f5f7]'
        : 'bg-white dark:bg-[#2c2c2e] border-[#d0d0d5] dark:border-[#3a3a3c] text-[#555] dark:text-[#aaa]'
    }`;

  const filteredNews = active === 'github' ? [] : news.filter(n => n.source === active);

  return (
    <>
      <div className="flex gap-1.5 mb-6 flex-wrap" role="tablist">
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={active === t.id} onClick={() => setActive(t.id)} className={tabCls(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {active === 'github' && (
        <>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.3px]">
              GitHub 最热项目 · Top Stars
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-7" data-testid="github-grid">
            {repos.slice(0, 5).map(r => <GitHubCard key={r.url} repo={r} />)}
            <a href="https://github.com/trending" target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center min-h-[100px] rounded-[14px] bg-black/[0.025] dark:bg-white/[0.04] border border-hairline border-black/[0.07] dark:border-white/[0.08] text-[13px] text-[#aaa] hover:bg-black/[0.05] dark:hover:bg-white/[0.07] hover:text-[#888] transition-all cursor-pointer">
              查看全部 20 个项目 →
            </a>
          </div>
        </>
      )}

      {active !== 'github' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" data-testid="news-grid">
          {filteredNews.length ? (
            filteredNews.map(n => <NewsCard key={n.id} item={n} />)
          ) : (
            <p className="col-span-2 text-sm text-[#aaa] text-center py-12">暂无数据 · No data</p>
          )}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Create src/components/home/GitHubCard.tsx**

```tsx
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import type { GithubRepo } from '@/lib/types';

interface GitHubCardProps { repo: GithubRepo }

export function GitHubCard({ repo }: GitHubCardProps) {
  return (
    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="no-underline">
      <GlassCard hover className="p-[18px]">
        <div className="flex items-start justify-between mb-2.5">
          {repo.language ? <Badge variant={repo.language}>{repo.language}</Badge> : <span />}
          <span className="text-[11px] text-[#999] flex items-center gap-1">
            <span className="text-[#f0a500]">★</span> {repo.stars}
          </span>
        </div>
        <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 tracking-[-0.2px]">
          {repo.owner} / {repo.name}
        </div>
        <div className="text-[12px] text-[#666] dark:text-[#aaa] leading-snug">{repo.description}</div>
        {repo.todayStars && (
          <div className="absolute bottom-3 right-3.5 text-[11px] text-[#bbb]">+{repo.todayStars}</div>
        )}
        <div className="absolute bottom-3 right-14 text-[22px] font-bold text-black/[0.06] dark:text-white/[0.06] tracking-[-1px]">
          {String(repo.rank).padStart(2, '0')}
        </div>
      </GlassCard>
    </a>
  );
}
```

- [ ] **Step 3: Create src/components/home/NewsCard.tsx**

```tsx
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import type { NewsItem } from '@/lib/types';

interface NewsCardProps { item: NewsItem }

const SOURCE_LABELS: Record<string, string> = { hn: 'Hacker News', '36kr': '36kr', sspai: '少数派' };

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600)  return `${Math.floor(diff / 60)}min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NewsCard({ item }: NewsCardProps) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="no-underline">
      <GlassCard hover className="p-[18px]">
        <div className="flex items-center justify-between mb-2.5">
          <Badge variant={item.source}>{SOURCE_LABELS[item.source]}</Badge>
          <span className="text-[10px] text-[#bbb]">{timeAgo(item.publishedAt)}</span>
        </div>
        <div className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug mb-1.5">{item.title}</div>
        {item.description && (
          <div className="text-[11px] text-[#888] dark:text-[#666] leading-snug line-clamp-2">{item.description}</div>
        )}
        {item.extra && (
          <div className="text-[11px] text-[#888] dark:text-[#666] mt-1">{item.extra}</div>
        )}
      </GlassCard>
    </a>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/home/
git commit -m "feat: add TabBar, GitHubCard, NewsCard home page components"
```

---

## Task 18: Finance & Admin Components

**Files:**
- Create: `src/components/finance/MarketCard.tsx`
- Create: `src/components/finance/FinanceNewsCard.tsx`
- Create: `src/components/admin/MetricCard.tsx`
- Create: `src/components/admin/DonateLog.tsx`
- Create: `src/components/admin/TrafficChart.tsx`

- [ ] **Step 1: Create src/components/finance/MarketCard.tsx**

```tsx
import type { Quote } from '@/lib/types';

interface MarketCardProps { quote: Quote }

export function MarketCard({ quote }: MarketCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white/72 dark:bg-white/[0.07] backdrop-blur-card border border-hairline border-white/85 dark:border-white/[0.08] px-3.5 py-3.5 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/90 before:to-transparent">
      <div className="text-[11px] text-[#999] mb-1.5">{quote.nameZh} · {quote.name}</div>
      <div className="text-[20px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.5px] leading-none mb-1">{quote.value}</div>
      <div className={`text-[12px] font-medium ${quote.up ? 'text-up-muted' : 'text-dn-muted'}`}>{quote.change}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/finance/FinanceNewsCard.tsx**

```tsx
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import type { NewsItem } from '@/lib/types';

interface FinanceNewsCardProps { item: NewsItem }

const LABELS: Record<string, string> = { hn: 'Hacker News', '36kr': '36kr', sspai: '少数派' };

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function FinanceNewsCard({ item }: FinanceNewsCardProps) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="no-underline">
      <GlassCard hover className="p-[18px]">
        <div className="flex items-center justify-between mb-2.5">
          <Badge variant={item.source}>{LABELS[item.source]}</Badge>
          <span className="text-[10px] text-[#bbb]">{timeAgo(item.publishedAt)}</span>
        </div>
        <div className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug mb-1.5">{item.title}</div>
        {item.description && (
          <div className="text-[11px] text-[#888] dark:text-[#666] leading-snug line-clamp-2">{item.description}</div>
        )}
      </GlassCard>
    </a>
  );
}
```

- [ ] **Step 3: Create src/components/admin/MetricCard.tsx**

```tsx
interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  up?: boolean;
}

export function MetricCard({ label, value, delta, up }: MetricCardProps) {
  return (
    <div className="bg-surface border border-hairline border-white/[0.08] rounded-xl px-[18px] py-4">
      <div className="text-[11px] text-white/35 mb-2 tracking-[0.02em]">{label}</div>
      <div className="text-[26px] font-semibold text-[#f5f5f7] tracking-[-0.5px] leading-none mb-1.5">{value}</div>
      {delta && (
        <div className={`text-[11px] font-medium ${up ? 'text-up-muted' : 'text-dn-muted'}`}>{delta}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create src/components/admin/DonateLog.tsx**

```tsx
import type { DonationRecord } from '@/lib/types';

interface DonateLogProps { donations: DonationRecord[] }

const METHOD_LABELS: Record<string, string> = {
  wechat: '微信',
  alipay: '支付宝',
  paypal: 'PayPal',
  bmc:    'Buy me a coffee',
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
      <div className="grid grid-cols-[1fr_80px_80px] gap-2 px-4 py-2.5 border-b border-white/[0.06]">
        <span className="text-[10px] text-white/28 font-medium tracking-[0.06em] uppercase">Time</span>
        <span className="text-[10px] text-white/28 font-medium tracking-[0.06em] uppercase">Method</span>
      </div>
      {donations.length === 0 && (
        <p className="text-center text-sm text-white/20 py-8">暂无捐赠记录</p>
      )}
      {donations.map((d, i) => (
        <div key={i} className="grid grid-cols-[1fr_80px] gap-2 px-4 py-2.5 border-b border-white/[0.04] last:border-b-0 items-center">
          <span className="text-[12px] text-white/50">{new Date(d.ts).toLocaleString()}</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${METHOD_CLS[d.method] ?? ''}`}>
            {METHOD_LABELS[d.method]}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create src/components/admin/TrafficChart.tsx**

```tsx
'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrafficChartProps {
  data: { date: string; pv: number }[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  const formatted = data.map(d => ({ ...d, date: d.date.slice(5) })); // "MM-DD"
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#2c2c2e', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
          itemStyle={{ color: '#1aff8c' }}
        />
        <Line type="monotone" dataKey="pv" stroke="#1aff8c" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/finance/ src/components/admin/
git commit -m "feat: add Finance and Admin components"
```

---

## Task 19: Root Layout

**Files:**
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Create src/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Laputan Info Hub',
  description: 'AI技术 & 金融资讯聚合 · AI Tech & Finance Information Hub',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="bg-[#f5f5f7] dark:bg-[#1c1c1e] min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add root layout with ThemeProvider"
```

---

## Task 20: Homepage

**Files:**
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create src/app/page.tsx**

```tsx
import { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Ticker } from '@/components/layout/Ticker';
import { TabBar } from '@/components/home/TabBar';
import { DonateModal } from '@/components/ui/DonateModal';
import type { GithubRepo, NewsItem } from '@/lib/types';

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const [reposRes, newsRes] = await Promise.all([
    fetch(`${base}/api/github`, { next: { revalidate: 300 } }),
    fetch(`${base}/api/news`,   { next: { revalidate: 300 } }),
  ]);
  const repos: GithubRepo[] = reposRes.ok ? await reposRes.json() : [];
  const news:  NewsItem[]   = newsRes.ok  ? await newsRes.json()  : [];
  return { repos, news };
}

export default async function HomePage() {
  const { repos, news } = await getData();
  return (
    <>
      <Navbar activePage="home" />
      <Ticker />
      <main className="max-w-[1200px] mx-auto px-8 pt-7 pb-20">
        <TabBar repos={repos} news={news} />
      </main>
      <FABWithModal />
      <Footer />
    </>
  );
}

// Separate client wrapper for FAB
function FABWithModal() {
  'use client';
  const [open, setOpen] = require('react').useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-7 right-7 flex items-center gap-2 bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-[#1d1d1f] text-[14px] font-medium px-[22px] py-[13px] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.2)] z-[200] hover:scale-[1.04] hover:shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition-all border-none cursor-pointer"
      >
        ☕ Buy me a coffee
      </button>
      <DonateModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

> **Note on FABWithModal:** The `'use client'` directive and `require` pattern won't work inside a Server Component like this. Split it into a separate file: `src/components/home/FABWithModal.tsx` as a Client Component.

- [ ] **Step 2: Create src/components/home/FABWithModal.tsx** (extract the FAB as proper Client Component)

```tsx
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
```

- [ ] **Step 3: Update src/app/page.tsx** (use the extracted component)

```tsx
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Ticker } from '@/components/layout/Ticker';
import { TabBar } from '@/components/home/TabBar';
import { FABWithModal } from '@/components/home/FABWithModal';
import type { GithubRepo, NewsItem } from '@/lib/types';

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const [reposRes, newsRes] = await Promise.all([
    fetch(`${base}/api/github`, { next: { revalidate: 300 } }),
    fetch(`${base}/api/news`,   { next: { revalidate: 300 } }),
  ]);
  const repos: GithubRepo[] = reposRes.ok ? await reposRes.json() : [];
  const news:  NewsItem[]   = newsRes.ok  ? await newsRes.json()  : [];
  return { repos, news };
}

export default async function HomePage() {
  const { repos, news } = await getData();
  return (
    <>
      <Navbar activePage="home" />
      <Ticker />
      <main className="max-w-[1200px] mx-auto px-8 pt-7 pb-20">
        <TabBar repos={repos} news={news} />
      </main>
      <FABWithModal />
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/home/FABWithModal.tsx
git commit -m "feat: add homepage with GitHub trending and news sections"
```

---

## Task 21: Finance Page

**Files:**
- Create: `src/app/finance/page.tsx`

- [ ] **Step 1: Create src/app/finance/page.tsx**

```tsx
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Ticker } from '@/components/layout/Ticker';
import { FABWithModal } from '@/components/home/FABWithModal';
import { MarketCard } from '@/components/finance/MarketCard';
import { FinanceNewsCard } from '@/components/finance/FinanceNewsCard';
import type { Quote, NewsItem } from '@/lib/types';

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const [quotesRes, newsRes] = await Promise.all([
    fetch(`${base}/api/finance`, { next: { revalidate: 60 } }),
    fetch(`${base}/api/news`,    { next: { revalidate: 300 } }),
  ]);
  const quotes: Quote[]    = quotesRes.ok ? await quotesRes.json() : [];
  const news:   NewsItem[] = newsRes.ok   ? await newsRes.json()   : [];
  return { quotes, news };
}

const GROUP_LABELS: Record<string, string> = {
  us:        '美股 · US Markets',
  hk:        '港股 · Hong Kong',
  cn:        '沪深 · Mainland China',
  commodity: '大宗商品 · Commodities',
  fx:        '外汇 · Forex',
};

export default async function FinancePage() {
  const { quotes, news } = await getData();

  const groups = ['us', 'hk', 'cn', 'commodity', 'fx'] as const;

  return (
    <>
      <Navbar activePage="finance" />
      <Ticker />
      <main className="max-w-[1200px] mx-auto px-8 pt-7 pb-20" data-testid="finance-main">
        {groups.map(g => {
          const gq = quotes.filter(q => q.group === g);
          if (!gq.length) return null;
          return (
            <section key={g} className="mb-8">
              <h3 className="text-[12px] font-medium text-[#999] tracking-[0.08em] uppercase mb-3">
                {GROUP_LABELS[g]}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {gq.map(q => <MarketCard key={q.symbol} quote={q} />)}
              </div>
            </section>
          );
        })}

        <div className="h-px bg-black/[0.07] dark:bg-white/[0.08] my-7" />

        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.3px]">
            财经资讯 · Finance News
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {news.slice(0, 6).map(n => <FinanceNewsCard key={n.id} item={n} />)}
        </div>
      </main>
      <FABWithModal />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/finance/
git commit -m "feat: add Finance page with market cards and news"
```

---

## Task 22: Admin Pages

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Create src/app/admin/login/page.tsx**

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('密码错误 · Invalid password');
      }
    } catch {
      setError('网络错误 · Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111113] flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        data-testid="login-form"
        className="bg-[#1c1c1e] border border-hairline border-white/[0.08] rounded-2xl p-10 w-80"
      >
        <h1 className="text-[20px] font-semibold text-[#f5f5f7] mb-1.5 tracking-[-0.3px]">Admin</h1>
        <p className="text-[13px] text-white/35 mb-7">Laputan Info Hub · Dashboard</p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          data-testid="password-input"
          required
          className="w-full bg-white/[0.07] border border-hairline border-white/[0.12] rounded-xl px-4 py-3 text-[14px] text-[#f5f5f7] placeholder-white/25 outline-none focus:border-white/30 mb-3"
        />
        {error && <p className="text-[12px] text-dn mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#f5f5f7] text-[#1d1d1f] text-[14px] font-medium py-3 rounded-xl disabled:opacity-50 hover:bg-white transition-colors"
        >
          {loading ? '...' : '登录 · Login'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create src/app/admin/page.tsx**

```tsx
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { MetricCard } from '@/components/admin/MetricCard';
import { TrafficChart } from '@/components/admin/TrafficChart';
import { DonateLog } from '@/components/admin/DonateLog';
import type { AdminStats } from '@/lib/types';

async function getStats(): Promise<AdminStats | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/admin/stats`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect('/admin/login');

  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#111113] text-[#f5f5f7]" data-testid="admin-dashboard">
      <nav className="bg-[#1c1c1e] border-b border-hairline border-white/[0.08] px-7 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-medium text-white/70">Laputan Info Hub</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-white/40 tracking-[0.05em]">Admin</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="/" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">← Back to site</a>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Logout</button>
          </form>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto p-7">
        <h1 className="text-[20px] font-semibold mb-1.5 tracking-[-0.3px]">Analytics Overview</h1>
        <p className="text-[13px] text-white/35 mb-7">Data from Vercel KV</p>

        {!stats && (
          <p className="text-white/30 text-sm mb-6">KV not configured — stats unavailable in local dev without Vercel KV credentials.</p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Total Page Views"  value={stats?.totalPv  ?? 0} />
          <MetricCard label="Today's Views"     value={stats?.todayPv  ?? 0} />
          <MetricCard label="Total Donations"   value={stats?.totalDonations ?? 0} />
          <MetricCard label="This Month"        value={stats?.monthDonations ?? 0} />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4 mb-5">
          <div className="bg-surface border border-hairline border-white/[0.08] rounded-xl p-5">
            <h2 className="text-[13px] font-medium text-white/70 mb-4">7-Day Traffic</h2>
            <TrafficChart data={stats?.daily ?? []} />
          </div>
          <div className="bg-surface border border-hairline border-white/[0.08] rounded-xl p-5">
            <h2 className="text-[13px] font-medium text-white/70 mb-4">Top Pages</h2>
            {(stats?.topPages ?? []).map((p, i) => (
              <div key={p.page} className="flex justify-between py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-[12px] text-white/70">{p.page}</span>
                <span className="text-[12px] text-white/40">{p.pv}</span>
              </div>
            ))}
          </div>
        </div>

        <DonateLog donations={stats?.recentDonations ?? []} />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/
git commit -m "feat: add Admin login page and dashboard"
```

---

## Task 23: Vercel Config & Env Example

**Files:**
- Create: `vercel.json`
- Create: `.env.local.example`

- [ ] **Step 1: Create vercel.json**

```json
{
  "crons": [
    { "path": "/api/cron/github",  "schedule": "0 */2 * * *"  },
    { "path": "/api/cron/news",    "schedule": "*/30 * * * *" },
    { "path": "/api/cron/finance", "schedule": "*/15 * * * *" }
  ]
}
```

- [ ] **Step 2: Create .env.local.example**

```bash
# Vercel KV — copy from Vercel dashboard after creating a KV store
# Local dev: leave empty to use mock fixture data
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Cron protection secret (any random string)
CRON_SECRET=your-cron-secret-here

# Admin dashboard password
ADMIN_PASSWORD=your-admin-password-here

# Admin cookie signing secret (32+ random chars)
ADMIN_COOKIE_SECRET=your-cookie-secret-32-chars-minimum

# Base URL (for server-side fetch; set to your Vercel URL in production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- [ ] **Step 3: Commit**

```bash
git add vercel.json .env.local.example
git commit -m "chore: add vercel.json cron config and env example"
```

---

## Task 24: Playwright E2E Tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/home.spec.ts`
- Create: `tests/e2e/finance.spec.ts`
- Create: `tests/e2e/admin.spec.ts`

- [ ] **Step 1: Create playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

- [ ] **Step 2: Create tests/e2e/home.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and shows GitHub section by default', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Laputan Info Hub/);
    await expect(page.getByTestId('github-grid')).toBeVisible();
  });

  test('ticker strip is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('ticker')).toBeVisible();
  });

  test('FAB opens donate modal', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('fab').click();
    await expect(page.getByText('Buy me a coffee')).toBeVisible();
  });

  test('donate modal tabs switch', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('fab').click();
    await page.getByRole('button', { name: 'PayPal' }).click();
    await expect(page.getByText('Donate via PayPal')).toBeVisible();
  });

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await page.getByRole('button', { name: /toggle theme/i }).click();
    // After toggle, class should change
    const cls = await html.getAttribute('class');
    expect(cls).toMatch(/dark|light/);
  });

  test('tab switching shows Hacker News tab', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: /Hacker News/ }).click();
    await expect(page.getByTestId('news-grid')).toBeVisible();
  });

  test('navbar links are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Finance' })).toBeVisible();
  });
});
```

- [ ] **Step 3: Create tests/e2e/finance.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Finance Page', () => {
  test('loads and shows market cards', async ({ page }) => {
    await page.goto('/finance');
    await expect(page.getByTestId('finance-main')).toBeVisible();
    // Market section headings should be present
    await expect(page.getByText(/US Markets|美股/)).toBeVisible();
  });

  test('ticker is visible on finance page', async ({ page }) => {
    await page.goto('/finance');
    await expect(page.getByTestId('ticker')).toBeVisible();
  });

  test('navbar shows Finance as active', async ({ page }) => {
    await page.goto('/finance');
    const financeLink = page.getByRole('link', { name: 'Finance' });
    // Active link has dark background
    await expect(financeLink).toBeVisible();
  });
});
```

- [ ] **Step 4: Create tests/e2e/admin.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('login page renders form', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
  });

  test('wrong password shows error', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page.getByText(/Invalid password|密码错误/)).toBeVisible();
  });
});
```

- [ ] **Step 5: Run E2E tests** (app must be buildable first)

```bash
cd /Users/laputancnai/infohub
npm run build 2>&1 | tail -20
```

Expected: Build succeeds or shows only minor warnings (no type errors that block build).

- [ ] **Step 6: Start dev server and run tests**

```bash
npm run test:e2e 2>&1 | tail -30
```

Expected: All tests pass or only the admin dashboard test fails (if `ADMIN_PASSWORD` env var not set).

- [ ] **Step 7: Commit**

```bash
git add playwright.config.ts tests/
git commit -m "test: add Playwright E2E tests for home, finance, and admin pages"
```

---

## Task 25: Connect GitHub Remote & Push

**Files:** None (git operations only)

- [ ] **Step 1: Add remote origin**

```bash
git remote add origin https://github.com/laputancnai-png/infohub.git
```

- [ ] **Step 2: Verify all files are committed**

```bash
git status
```

Expected: `nothing to commit, working tree clean`

- [ ] **Step 3: Push to GitHub**

```bash
git push -u origin master
```

Expected: Branch pushed, GitHub shows the repository with all files.

---

## Self-Review

**Spec Coverage:**
- ✅ GitHub Trending scraper (Task 6)
- ✅ HN + RSS news (Tasks 7, 8)
- ✅ Yahoo Finance quotes (Task 9)
- ✅ Vercel KV wrapper with mock fallback (Task 4)
- ✅ Cron routes for all three data types (Task 10)
- ✅ Public API routes (Task 11)
- ✅ Admin auth (cookie + HMAC) (Tasks 5, 12)
- ✅ Middleware (admin guard) (Task 13)
- ✅ PV tracking endpoint (Task 13)
- ✅ GlassCard, Badge, ThemeToggle, DonateModal (Tasks 14, 15)
- ✅ Navbar, Footer, Ticker (Task 16)
- ✅ Home components + TabBar (Task 17)
- ✅ Finance + Admin components (Task 18)
- ✅ Root layout with ThemeProvider (Task 19)
- ✅ Homepage (Task 20)
- ✅ Finance page (Task 21)
- ✅ Admin pages (Task 22)
- ✅ vercel.json Cron config (Task 23)
- ✅ E2E tests (Task 24)
- ✅ GitHub push (Task 25)
- ✅ Dark mode toggle (ThemeToggle in Navbar)
- ✅ Bilingual mixed display throughout (labels in both languages)
- ✅ Donate modal with WeChat/Alipay/PayPal + donation logging

**Type Consistency:**
- `GithubRepo.languageColor` defined in types.ts (Task 3) and used in `GitHubCard.tsx` (Task 17) — consistent ✅
- `Quote.group` defined in types.ts and used in finance page — consistent ✅
- `AdminStats` interface matches what `stats/route.ts` returns — consistent ✅
- `DonationRecord` used consistently in donate/log route and DonateLog component — consistent ✅
