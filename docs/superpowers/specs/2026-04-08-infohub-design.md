# Laputan Info Hub — 设计规范 v1.0

**日期**：2026-04-08  
**项目**：news.36techsolutions.com  
**技术栈**：Next.js 14 · Tailwind CSS · Vercel KV · Vercel Cron

---

## 1. 项目概述

Laputan Info Hub 是一个面向 AI 技术爱好者和投资者的信息聚合平台，提供：
- GitHub Trending 热门项目
- Hacker News + 36kr + 少数派新闻聚合
- 全球金融行情（指数、商品、外汇）
- 捐赠支持功能
- Admin 后台（流量统计 + 捐赠记录）

UI 风格：毛玻璃卡片、深海底色、双语混排（中英并列，不做语言切换）、日夜模式手动切换 + 跟随系统。

---

## 2. 整体架构

### 架构模式：Cron 写、API 只读 KV

```
Vercel Cron Jobs
  ├── /api/cron/github   (每 2h)  → 拉 GitHub Trending HTML → 格式化 → 写 KV
  ├── /api/cron/news     (每 30min) → 拉 HN API + 36kr/少数派 RSS → 写 KV
  └── /api/cron/finance  (每 15min) → 拉 Yahoo Finance 非官方接口 → 写 KV

用户请求
  ├── page.tsx (Server Component) → fetch /api/github, /api/news, /api/finance
  ├── /api/github   → 读 KV:github:trending
  ├── /api/news     → 读 KV:news:*
  ├── /api/finance  → 读 KV:finance:quotes
  └── /api/admin/stats → 读 KV:admin:*

middleware.ts
  ├── 保护 /admin/* 路由（验证签名 cookie）
  └── 异步写 PV 计数到 KV（不阻塞响应）
```

**核心原则**：外部 API 故障不影响页面展示（显示上次 KV 缓存），用户请求纯读 KV，响应极快。

---

## 3. 目录结构

```
src/
├── app/
│   ├── layout.tsx                  # ThemeProvider + Navbar + Footer
│   ├── page.tsx                    # AI Tech 主页（Server Component）
│   ├── finance/page.tsx            # Finance 页（Server Component）
│   ├── admin/
│   │   ├── page.tsx                # Admin Dashboard（需 cookie 鉴权）
│   │   └── login/page.tsx          # 登录页
│   └── api/
│       ├── github/route.ts         # 读 KV → 返回 GithubRepo[]
│       ├── news/route.ts           # 读 KV → 返回 NewsItem[]
│       ├── finance/route.ts        # 读 KV → 返回 Quote[]
│       ├── donate/log/route.ts     # 写 KV sorted set（捐赠点击记录）
│       ├── admin/
│       │   ├── login/route.ts      # 验密码 → 写 HttpOnly cookie
│       │   └── stats/route.ts      # 读 KV admin 数据
│       └── cron/
│           ├── github/route.ts     # Cron：scrape GitHub Trending
│           ├── news/route.ts       # Cron：HN API + RSS
│           └── finance/route.ts    # Cron：Yahoo Finance
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx              # Logo + 导航 + ThemeToggle
│   │   ├── Footer.tsx              # 版权 + 捐赠按钮组
│   │   └── Ticker.tsx              # 行情滚动条（Client Component）
│   ├── home/
│   │   ├── TabBar.tsx              # Tab 切换（Client Component）
│   │   ├── GitHubCard.tsx          # GitHub 项目卡片
│   │   └── NewsCard.tsx            # 新闻卡片
│   ├── finance/
│   │   ├── MarketCard.tsx          # 行情指数卡片
│   │   └── FinanceNewsCard.tsx     # 财经新闻卡片
│   ├── admin/
│   │   ├── MetricCard.tsx          # 统计数字卡片
│   │   ├── DonateLog.tsx           # 捐赠记录列表
│   │   └── TrafficChart.tsx        # 流量折线图（recharts）
│   └── ui/
│       ├── GlassCard.tsx           # 毛玻璃卡片原语
│       ├── Badge.tsx               # 来源/语言标签
│       ├── DonateModal.tsx         # 捐赠弹窗（Client Component）
│       └── ThemeToggle.tsx         # 日夜切换按钮（Client Component）
├── lib/
│   ├── kv.ts                       # Vercel KV 封装（get/set/incr）
│   ├── auth.ts                     # cookie 签名验证
│   └── scrapers/
│       ├── github.ts               # GitHub Trending HTML scraper
│       ├── hn.ts                   # Hacker News API client
│       ├── rss.ts                  # RSS 解析（36kr / 少数派）
│       └── yahoo.ts                # Yahoo Finance 非官方接口
└── middleware.ts                   # PV 计数 + /admin 路由保护
```

---

## 4. 数据层

### KV Key Schema

| Key | TTL | 类型 | 内容 |
|-----|-----|------|------|
| `github:trending` | 3h | JSON | `GithubRepo[]` |
| `news:hn` | 45min | JSON | `NewsItem[]` |
| `news:rss:36kr` | 45min | JSON | `NewsItem[]` |
| `news:rss:sspai` | 45min | JSON | `NewsItem[]` |
| `finance:quotes` | 20min | JSON | `Quote[]` |
| `admin:pv:{page}` | 永久 | number | 累计 PV |
| `admin:pv:daily:{YYYY-MM-DD}:{page}` | 90d | number | 日 PV |
| `admin:donations` | 永久 | sorted set | score=timestamp, value=JSON |

### 核心数据类型

```typescript
interface GithubRepo {
  rank: number;
  owner: string;
  name: string;
  description: string;
  language: string;
  stars: string;        // "142.3k"
  todayStars: string;   // "1,234 stars today"
  url: string;
}

interface NewsItem {
  id: string;
  source: 'hn' | '36kr' | 'sspai';
  title: string;
  description?: string;
  url: string;
  publishedAt: string;  // ISO 8601
  extra?: string;       // HN: "432 points · 187 comments"
}

interface Quote {
  symbol: string;
  name: string;         // "S&P 500"
  value: string;        // "5,218.20"
  change: string;       // "+0.42%"
  up: boolean;
}

interface DonationRecord {
  method: 'wechat' | 'alipay' | 'paypal' | 'bmc';
  ts: number;           // Unix timestamp
}
```

---

## 5. UI / 组件层

### Tailwind 配置扩展

```js
// tailwind.config.ts
darkMode: 'class',
theme: {
  extend: {
    colors: {
      void:      '#0A0A14',
      surface:   '#1c1c1e',
      up:        '#1aff8c',
      'up-muted':'#1aad64',
      dn:        '#ff4d6a',
      'dn-muted':'#e0364f',
    },
    borderWidth: { hairline: '0.5px' },
  }
}
```

### Dark Mode

- 使用 `next-themes`，`attribute="class"`，默认跟随系统
- 用户手动切换持久化至 `localStorage`
- `ThemeToggle` Client Component 放于 Navbar 右侧
- 所有 dark 样式用 Tailwind `dark:` 前缀

### 共享原语

**GlassCard**：
- Light: `bg-white/70 backdrop-blur-card border-hairline border-white/85 rounded-[14px]`
- Dark: `dark:bg-white/[0.07] dark:border-white/[0.08]`
- `hover` prop: `hover:-translate-y-0.5 hover:shadow-lg hover:bg-white/90`
- 内置高光线：`before:` 伪元素，顶部 1px 渐变

**Badge**：`variant` prop 对应各数据源/语言的色彩方案

**Ticker**：Client Component，`/api/finance` 拉数据，纯 CSS `translateX` 动画，`animation-duration: 50s linear infinite`

**DonateModal**：三 tab（微信/支付宝/PayPal），中英双语，点击跳转前调 `/api/donate/log`

---

## 6. Cron 与鉴权

### Cron 配置（vercel.json）

```json
{
  "crons": [
    { "path": "/api/cron/github",  "schedule": "0 */2 * * *"  },
    { "path": "/api/cron/news",    "schedule": "*/30 * * * *" },
    { "path": "/api/cron/finance", "schedule": "*/15 * * * *" }
  ]
}
```

所有 Cron Route 验证 `Authorization: Bearer $CRON_SECRET` header。

### 环境变量

| 变量 | 用途 |
|------|------|
| `KV_REST_API_URL` | Vercel KV（自动注入） |
| `KV_REST_API_TOKEN` | Vercel KV（自动注入） |
| `CRON_SECRET` | 保护 Cron 路由，防公开触发 |
| `ADMIN_PASSWORD` | Admin 登录密码 |
| `ADMIN_COOKIE_SECRET` | 签名 cookie 随机串（32位+） |

### Admin 鉴权流程

1. `middleware.ts` 匹配 `/admin/:path*`，验证签名 cookie
2. cookie 无效 → `redirect('/admin/login')`
3. `POST /api/admin/login`：比对 `ADMIN_PASSWORD` → 写 `HttpOnly; SameSite=Strict; Max-Age=604800` cookie → 跳转 `/admin`
4. cookie 签名：`HMAC-SHA256(value, ADMIN_COOKIE_SECRET)`

### PV 计数

`middleware.ts` 对每次非 API、非静态资源的请求，`waitUntil(kv.incr(...))` 异步写入，不阻塞响应：
- `admin:pv:{pathname}` — 累计
- `admin:pv:daily:{YYYY-MM-DD}:{pathname}` — 日粒度，TTL 90 天

### 捐赠记录

捐赠按钮点击时（跳外链前）：`POST /api/donate/log` → `kv.zadd('admin:donations', { score: Date.now(), member: JSON.stringify({method, ts}) })`

---

## 7. 页面结构

### 主页（AI Tech）

```
Navbar (Server)
Ticker (Client) ← /api/finance
main (Server, fetch /api/github + /api/news)
  TabBar (Client) — GitHub热门 / HN / 36kr / 少数派
  GitHubSection → GitHubCard × 5 + "查看全部"
  Divider
  NewsSection → NewsCard × 4
FAB "Buy me a coffee" (Client) → DonateModal
Footer (Server)
```

### Finance 页

```
Navbar
Ticker (Client)
main (Server, fetch /api/finance + /api/news?source=finance)
  MarketSection: US / HK / CN / 商品 / 外汇
  Divider
  FinanceNews → FinanceNewsCard × 4
FAB → DonateModal
Footer
```

### Admin 页（需 cookie）

```
AdminNav (links: Overview / Donations / ← Back)
main (Client, fetch /api/admin/stats)
  MetricCards: 总PV / 今日PV / 总捐赠次数 / 本月捐赠
  TrafficChart (recharts 折线图，7日 PV)
  DonutChart (页面分布)
  底部两列: TopContent 表格 / DonateLog 列表
```

---

## 8. 依赖清单

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "tailwindcss": "^3",
    "next-themes": "latest",
    "@vercel/kv": "latest",
    "recharts": "^2",
    "rss-parser": "latest"
  }
}
```

GitHub Trending 用 `fetch` + 正则/简单字符串解析 HTML，无需额外库。Yahoo Finance 用 `fetch` 非官方接口，无需库。

---

## 9. 不在 Phase 1 范围内

- X/Twitter、Bloomberg、Reuters 数据源
- 完整 i18n 路由（`/en`、`/zh`）
- YouTube 视频聚合
- Admin 内容管理（增删改新闻）
- 用户账户系统
