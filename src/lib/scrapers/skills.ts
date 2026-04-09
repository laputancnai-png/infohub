import type { AgentSkill } from '../types';

// ── SkillHub.cn REST API ──────────────────────────────────────────────────────
export async function fetchSkillHubSkills(limit = 20): Promise<AgentSkill[]> {
  const res = await fetch('https://api.skillhub.cn/api/v1/showcase/hot', {
    headers: { 'Accept': 'application/json', 'Referer': 'https://skillhub.cn/' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`SkillHub fetch failed: ${res.status}`);
  const data = (await res.json()) as { skills: SkillHubItem[] };

  return (data.skills ?? []).slice(0, limit).map((s, i) => ({
    rank: i + 1,
    name: s.name,
    nameZh: s.description_zh ? extractShortZh(s.description_zh) : undefined,
    description: s.description ?? '',
    descriptionZh: s.description_zh ?? undefined,
    author: s.ownerName ?? '',
    downloads: s.downloads ?? 0,
    stars: s.stars ?? 0,
    url: s.homepage ?? `https://skillhub.cn/skill/${s.slug}`,
    source: 'skillhub' as const,
    category: s.category ?? '',
  }));
}

interface SkillHubItem {
  name: string;
  description?: string;
  description_zh?: string;
  ownerName?: string;
  downloads?: number;
  stars?: number;
  homepage?: string;
  slug?: string;
  category?: string;
}

// ── ClawHub Convex API ────────────────────────────────────────────────────────
const CONVEX_URL = 'https://wry-manatee-359.convex.cloud/api/query';

export async function fetchClawHubSkills(limit = 20): Promise<AgentSkill[]> {
  const res = await fetch(CONVEX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'convex-client': 'npm-1.34.1',
      'Referer': 'https://clawhub.ai/',
    },
    body: JSON.stringify({
      path: 'skills:listPublicPageV4',
      format: 'convex_encoded_json',
      args: [{ dir: 'desc', nonSuspiciousOnly: true, numItems: limit, sort: 'downloads' }],
    }),
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`ClawHub fetch failed: ${res.status}`);
  const data = (await res.json()) as ConvexResponse;
  const items = data?.value?.page ?? [];

  return items.slice(0, limit).map((item, i) => {
    const skill = item.skill;
    const owner = item.owner ?? item.ownerHandle;
    const handle = typeof owner === 'string' ? owner : owner?.handle ?? '';
    return {
      rank: i + 1,
      name: skill.displayName ?? skill.slug ?? '',
      description: skill.summary ?? '',
      author: handle,
      downloads: Math.round(skill.stats?.downloads ?? 0),
      stars: Math.round(skill.stats?.stars ?? 0),
      url: `https://clawhub.ai/${handle}/${skill.slug}`,
      source: 'clawhub' as const,
      category: '',
    };
  });
}

interface ConvexResponse {
  status: string;
  value?: {
    page: ConvexSkillItem[];
    hasMore: boolean;
  };
}
interface ConvexSkillItem {
  skill: {
    displayName?: string;
    slug: string;
    summary?: string;
    stats?: { downloads?: number; stars?: number; installsCurrent?: number };
  };
  owner?: { handle: string; displayName: string };
  ownerHandle?: string;
}

function extractShortZh(text: string): string {
  // Take first sentence of Chinese description (up to first 。or ，or 30 chars)
  const match = text.match(/^[^。，]{1,40}/);
  return match ? match[0] : text.slice(0, 40);
}
