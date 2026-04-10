import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://infohub.36techsolutions.com';
  return [
    { url: base,           lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/finance`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ];
}
