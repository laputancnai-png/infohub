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
  const articleRegex = /<article[^>]*class="[^"]*Box-row[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
  let match: RegExpExecArray | null;
  let rank = 0;

  while ((match = articleRegex.exec(html)) !== null && rank < 20) {
    rank++;
    const block = match[1];

    const hrefMatch = /href="\/([^/"]+)\/([^/"]+)"/.exec(block);
    if (!hrefMatch) continue;
    const owner = hrefMatch[1];
    const name = hrefMatch[2];

    const descMatch = /<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/.exec(block);
    const description = descMatch
      ? descMatch[1].replace(/<[^>]+>/g, '').trim()
      : '';

    const langMatch = /itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/.exec(block);
    const language = langMatch ? langMatch[1].trim() : '';

    const starsMatch = /aria-label="([\d,]+) users starred"/.exec(block)
      ?? /aria-label="([\d,]+) star"/.exec(block);
    const starsRaw = starsMatch ? starsMatch[1].replace(/,/g, '') : '0';
    const starsNum = parseInt(starsRaw, 10);
    const stars = starsNum >= 1000
      ? `${(starsNum / 1000).toFixed(1)}k`
      : String(starsNum);

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
