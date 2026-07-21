import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedBlogs } from '@/lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Blog & Case Studies — Priyesh Mishra',
  description:
    'Articles and design case studies by Priyesh Mishra on UI/UX, product design, branding, and growth.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Blog & Case Studies — Priyesh Mishra',
    description: 'Articles and design case studies by Priyesh Mishra.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
};

export default async function BlogIndexPage() {
  const blogs = await getPublishedBlogs();

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-bg to-purple-900/20 text-white">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Blog</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Blog &amp; Case Studies</h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Writing on UI/UX, product design, branding, and growth.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((b) => (
            <Link
              key={b.slug}
              href={`/blog/${b.slug}`}
              className="group flex gap-4 rounded-xl overflow-hidden border border-white/15 bg-white/5 hover:border-brand-purple/50 transition-colors p-4"
            >
              {b.thumbnail?.url && (
                <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={b.thumbnail.url}
                    alt={b.thumbnail.alternativeText || b.title}
                    width={112}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-semibold leading-snug mb-1 line-clamp-2">{b.title}</h2>
                <p className="text-sm text-gray-400 line-clamp-2">{b.excerpt || b.content}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
