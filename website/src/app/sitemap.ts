import type { MetadataRoute } from 'next';

import { consumerCompetitorSlugs } from '@/lib/consumerCompetitors';

const baseUrl = 'https://emmaline.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/best-ai-phone-assistant`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  const comparisonRoutes: MetadataRoute.Sitemap = consumerCompetitorSlugs.map((slug) => ({
    url: `${baseUrl}/compare/${slug}-vs-emmaline`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...comparisonRoutes];
}