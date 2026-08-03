import React from 'react';
import { connectDB } from '@/lib/db/mongoose';
import Blog from '@/models/Blog';
import HomeClient from './HomeClient';
import HomeSeoContent from '../components/HomeSeoContent';
import { getPortfolioContent } from '@/lib/content';
import { FAQS } from '@/data/faqs';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

export const revalidate = 3600;

const PERSON = {
  '@type': 'Person',
  name: 'Priyesh Mishra',
  url: SITE_URL,
  image: `${SITE_URL}/images/profile.png`,
  jobTitle: 'UI/UX Designer & Developer',
  description:
    'UI/UX designer, developer, and performance marketing expert crafting high-converting digital products and data-driven growth.',
  sameAs: [
    'https://linkedin.com/in/priyeshmishra16',
    'https://instagram.com/designxpo.in',
    'https://twitter.com/mepriyeshm',
    'https://priyeshmishra1602.medium.com',
  ],
};

// FAQS is imported from data/faqs.ts (shared with the visible <Faq> section).

async function getBlogs(): Promise<any[]> {
  try {
    await connectDB();
    const blogs: any[] = await (Blog as any)
      .find({ published: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean();
    return blogs || [];
  } catch (err) {
    console.error('[HomePage] blog fetch failed:', (err as any)?.message || err);
    return [];
  }
}

function buildBlogPostingSchemas(blogs: any[]) {
  return blogs.map((b) => {
    const published = b.publishedAt || b.createdAt || new Date().toISOString();
    const modified = b.updatedAt || b.createdAt || published;
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: b.title,
      description: b.excerpt || b.metaDescription || '',
      image: b.thumbnail?.url || b.ogImage || undefined,
      url: b.url || b.canonicalUrl || SITE_URL,
      mainEntityOfPage: SITE_URL,
      author: { ...PERSON, '@type': 'Person' },
      publisher: { ...PERSON, '@type': 'Person' },
      datePublished: new Date(published).toISOString(),
      dateModified: new Date(modified).toISOString(),
      keywords: b.metaKeywords || undefined,
    };
  });
}

function buildFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    description: 'Frequently asked questions about Priyesh Mishra — services, technologies, location, and how to hire.',
    inLanguage: 'en',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

// WebPage with speakable (voice/LLM readiness) + a machine-readable dateModified.
function buildWebPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: SITE_URL,
    name: 'Priyesh Mishra — UI/UX Designer & Developer',
    inLanguage: 'en',
    dateModified: new Date().toISOString(),
    primaryImageOfPage: `${SITE_URL}/images/profile.png`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '#faq h3', '#faq p'],
    },
    about: { ...PERSON },
  };
}

export default async function HomePage() {
  const [blogs, content] = await Promise.all([getBlogs(), getPortfolioContent()]);
  const blogSchemas = buildBlogPostingSchemas(blogs);
  const faqSchema = buildFaqSchema();
  const webPageSchema = buildWebPageSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {blogSchemas.map((schema, i) => (
        <script
          key={`blog-ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {/* Crawlable body content in the initial HTML for no-JS crawlers/social
          scrapers. Wrapped in <noscript> so real (JS-enabled) users never see
          it — the browser only renders it when JS is off, which removes the
          on-load flash of plain content the timing-based approach caused. */}
      <noscript>
        <HomeSeoContent data={content} />
      </noscript>
      <HomeClient />
    </>
  );
}
