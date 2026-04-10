import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { PageTracker } from '@/components/ui/PageTracker';
import './globals.css';

const SITE_URL = 'https://infohub.36techsolutions.com';
const SITE_NAME = 'Laputan Info Hub';
const DESCRIPTION = '一站式 AI 技术与金融资讯聚合 — GitHub 热门项目、Hacker News、Agent Skills、MarketWatch、FT、CNBC 实时更新';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: ['AI', '人工智能', 'GitHub Trending', 'Hacker News', 'Agent Skills', '金融资讯', 'MarketWatch', 'Financial Times', 'CNBC', '科技资讯'],
  authors: [{ name: 'Laputan' }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
    locale: 'zh_CN',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  inLanguage: ['zh-CN', 'en'],
  potentialAction: {
    '@type': 'ReadAction',
    target: [SITE_URL, `${SITE_URL}/finance`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#f5f5f7] dark:bg-[#1c1c1e] min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PageTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
