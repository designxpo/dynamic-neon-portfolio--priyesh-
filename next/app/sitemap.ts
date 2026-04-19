import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db/mongoose';
import Blog from '@/models/Blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/#about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#works`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/#contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
  ];

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const blogs: any[] = await (Blog as any)
      .find({ published: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean();

    blogEntries = (blogs || []).map((b) => {
      const slug = (b.slug && String(b.slug).trim()) || slugify(b.title || String(b._id));
      const lastModified = b.updatedAt || b.createdAt || new Date();
      return {
        url: `${SITE_URL}/blog/${slug}`,
        lastModified: new Date(lastModified),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    });
  } catch (err) {
    console.error('[sitemap] blog fetch failed:', (err as any)?.message || err);
  }

  return [...staticEntries, ...blogEntries];
}
