import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const sections = ['', '#works', '#process', '#services', '#experience', '#contact'];
  return sections.map((section) => ({
    url: `${SITE_URL}/${section}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: section === '' ? 1.0 : 0.8,
  }));
}
