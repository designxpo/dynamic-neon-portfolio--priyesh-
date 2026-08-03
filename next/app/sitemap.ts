import type { MetadataRoute } from 'next';
import { getProjects, getPublishedBlogs } from '@/lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/tools`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/tools/project-cost-estimator`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  let projectEntries: MetadataRoute.Sitemap = [];
  try {
    const projects = await getProjects();
    projectEntries = projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error('[sitemap] project fetch failed:', (err as any)?.message || err);
  }

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const blogs = await getPublishedBlogs();
    blogEntries = blogs.map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error('[sitemap] blog fetch failed:', (err as any)?.message || err);
  }

  return [...staticEntries, ...projectEntries, ...blogEntries];
}
