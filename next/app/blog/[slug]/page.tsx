import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPublishedBlogs, getBlogBySlug } from '@/lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const blogs = await getPublishedBlogs();
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) return { title: 'Article not found — Priyesh Mishra' };

  const title = blog.metaTitle || `${blog.title} — Priyesh Mishra`;
  const description = blog.metaDescription || blog.excerpt || (blog.content || '').slice(0, 160);
  const url = `${SITE_URL}/blog/${blog.slug}`;
  const image = blog.ogImage || blog.thumbnail?.url;

  return {
    title,
    description,
    keywords: blog.metaKeywords || undefined,
    alternates: { canonical: blog.canonicalUrl || url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) notFound();

  const url = `${SITE_URL}/blog/${blog.slug}`;
  const published = blog.publishedAt || undefined;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt || blog.metaDescription || '',
    image: blog.thumbnail?.url || blog.ogImage || undefined,
    url,
    mainEntityOfPage: url,
    author: { '@type': 'Person', name: blog.author || 'Priyesh Mishra', url: SITE_URL },
    publisher: { '@type': 'Person', name: 'Priyesh Mishra', url: SITE_URL },
    datePublished: published,
    keywords: blog.metaKeywords || undefined,
  };

  // Posts may be canonical elsewhere (e.g. Medium); if so, surface a "read full article" link.
  const externalUrl = blog.url && /^https?:\/\//.test(blog.url) ? blog.url : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-bg to-purple-900/20 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-white">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-white line-clamp-1">{blog.title}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{blog.title}</h1>
          <p className="text-sm text-gray-500">
            {blog.author || 'Priyesh Mishra'}
            {published ? ` · ${new Date(published).toLocaleDateString()}` : ''}
          </p>
        </header>

        {blog.thumbnail?.url && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 mb-10">
            <Image
              src={blog.thumbnail.url}
              alt={blog.thumbnail.alternativeText || blog.title}
              width={1024}
              height={576}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {blog.excerpt && <p className="text-lg text-gray-300 mb-6">{blog.excerpt}</p>}

        {blog.content && (
          <div className="prose prose-invert max-w-none mb-10">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{blog.content}</p>
          </div>
        )}

        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2.5 rounded-lg bg-brand-purple hover:bg-brand-purple/80 transition-colors font-medium"
          >
            Read the full article →
          </a>
        )}
      </article>
    </main>
  );
}
