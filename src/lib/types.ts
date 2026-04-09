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
  source: 'hn' | 'marketwatch' | 'ft' | 'cnbc';
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
