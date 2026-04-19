import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'PerplexityBot',
  'anthropic-ai',
  'ClaudeBot',
  'Google-Extended',
  'Amazonbot',
  'Applebot',
  'Applebot-Extended',
  'CCBot',
  'cohere-ai',
  'Bytespider',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin', '/login'],
      },
      ...AI_CRAWLERS.map((ua) => ({
        userAgent: ua,
        allow: '/',
        disallow: ['/admin', '/api/admin', '/login'],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
