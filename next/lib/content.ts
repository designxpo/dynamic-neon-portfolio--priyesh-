/**
 * Server-side content access for the SSR pages (home SEO block, /projects,
 * /blog and their [slug] detail pages, and the sitemap).
 *
 * Every query hits MongoDB but falls back to the mock/default content when the
 * DB is unavailable (e.g. at build time with no MONGODB_URI) so pages still
 * render real content instead of 500-ing or coming up empty. Results are
 * JSON-serialisable plain objects (ObjectId/Date stripped) so they can cross
 * the server→client boundary.
 */
import { connectDB } from '@/lib/db/mongoose';
import Project from '@/models/Project';
import Blog from '@/models/Blog';
import Hero from '@/models/Hero';
import { slugify } from '@/lib/slug';
import { buildDefaults } from '@/models/SiteConfig';
import {
  mockHeroData,
  mockServicesData,
  mockProjectsData,
  mockExperiencesData,
  mockEducationsData,
  mockSkillsData,
} from '@/data/mockData';

/** Deep-clone to a plain, serialisable object (drops ObjectId, Date, Mongoose internals). */
function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null));
}

export type ContentProject = {
  slug: string;
  title: string;
  descriptionShort?: string;
  descriptionLong?: string;
  category?: string;
  categories?: string[];
  coverImage?: { url?: string; alternativeText?: string };
  technologies?: string[];
  outcome?: string;
  clientName?: string;
  timeline?: string;
  liveUrl?: string;
  sourceUrl?: string;
};

export type ContentBlog = {
  slug: string;
  title: string;
  author?: string;
  excerpt?: string;
  content?: string;
  url?: string;
  canonicalUrl?: string;
  thumbnail?: { url?: string; alternativeText?: string };
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
};

function withProjectSlug(p: any): ContentProject {
  return { ...plain(p), slug: (p?.slug && String(p.slug).trim()) || slugify(p?.title || '') };
}

function withBlogSlug(b: any): ContentBlog {
  return { ...plain(b), slug: (b?.slug && String(b.slug).trim()) || slugify(b?.title || '') };
}

export async function getProjects(): Promise<ContentProject[]> {
  try {
    await connectDB();
    const docs: any[] = await (Project as any).find({}).sort({ featured: -1, createdAt: -1 }).lean();
    if (docs && docs.length) return docs.map(withProjectSlug);
  } catch (err) {
    console.error('[content] getProjects fell back to mock:', (err as any)?.message || err);
  }
  return (mockProjectsData as any[]).map(withProjectSlug);
}

export async function getProjectBySlug(slug: string): Promise<ContentProject | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) || null;
}

export async function getPublishedBlogs(): Promise<ContentBlog[]> {
  try {
    await connectDB();
    const docs: any[] = await (Blog as any)
      .find({ published: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean();
    if (docs && docs.length) return docs.map(withBlogSlug);
  } catch (err) {
    console.error('[content] getPublishedBlogs fell back to defaults:', (err as any)?.message || err);
  }
  const fallback = (buildDefaults() as any).blogs || [];
  return fallback.map(withBlogSlug);
}

export async function getBlogBySlug(slug: string): Promise<ContentBlog | null> {
  const all = await getPublishedBlogs();
  return all.find((b) => b.slug === slug) || null;
}

/** Core textual portfolio content for the home page's server-rendered SEO block. */
export async function getPortfolioContent() {
  const projects = await getProjects();

  let hero: any = { ...mockHeroData, profileImage: { url: '/images/profile.png', alternativeText: 'Priyesh Mishra' } };
  try {
    await connectDB();
    const doc: any = await (Hero as any).findOne({}).sort({ createdAt: -1 }).lean();
    if (doc) hero = plain(doc);
  } catch (err) {
    console.error('[content] getPortfolioContent hero fell back to mock:', (err as any)?.message || err);
  }

  return {
    hero,
    services: plain(mockServicesData),
    projects,
    experiences: plain(mockExperiencesData),
    educations: plain(mockEducationsData),
    skills: plain(mockSkillsData),
  };
}
