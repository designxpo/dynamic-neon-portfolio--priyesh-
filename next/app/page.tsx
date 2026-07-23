import React from 'react';
import { connectDB } from '@/lib/db/mongoose';
import Blog from '@/models/Blog';
import HomeClient from './HomeClient';
import HomeSeoContent from '../components/HomeSeoContent';
import { getPortfolioContent } from '@/lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

export const revalidate = 3600;

const PERSON = {
  '@type': 'Person',
  name: 'Priyesh Mishra',
  url: SITE_URL,
};

const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: 'What does Priyesh Mishra do?',
    answer:
      'Priyesh Mishra is a Product Design Consultant and UX Strategist who leads product development for Mindbird.ai at Scaletrix.AI. He works across UX/UI design, product strategy, and performance marketing for D2C and SaaS brands.',
  },
  {
    question: 'What is Mindbird.ai?',
    answer:
      'Mindbird.ai is a WhatsApp sales automation platform built at Scaletrix.AI. Priyesh leads its product development, including UX, positioning, and integration with Meta Ads click-to-WhatsApp (CTWA) campaigns.',
  },
  {
    question: 'What services does Priyesh Mishra offer?',
    answer:
      'UX/UI audits and product strategy for D2C and SaaS, WhatsApp marketing automation and CTWA campaign setup, performance marketing on Meta Ads and Google Ads with server-side tracking, and full-stack Next.js product development.',
  },
  {
    question: 'Where is Priyesh Mishra based?',
    answer:
      'Priyesh Mishra is based in New Delhi, India, and works with clients and teams worldwide.',
  },
  {
    question: 'What industries has Priyesh Mishra worked in?',
    answer:
      'Priyesh has 2.5 years of experience across fintech, sports, and eCommerce, covering product management, UX design, and performance marketing.',
  },
];

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

export default async function HomePage() {
  const [blogs, content] = await Promise.all([getBlogs(), getPortfolioContent()]);
  const blogSchemas = buildBlogPostingSchemas(blogs);
  const faqSchema = buildFaqSchema();

  return (
    <>
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
