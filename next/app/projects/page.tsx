import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getProjects } from '@/lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Projects & Case Studies — Priyesh Mishra',
  description:
    'UI/UX design and product case studies by Priyesh Mishra — fintech, SaaS, and D2C projects covering research, design systems, and measurable outcomes.',
  alternates: { canonical: `${SITE_URL}/projects` },
  openGraph: {
    title: 'Projects & Case Studies — Priyesh Mishra',
    description: 'Selected UI/UX and product design case studies by Priyesh Mishra.',
    url: `${SITE_URL}/projects`,
    type: 'website',
  },
};

export default async function ProjectsIndexPage() {
  const projects = await getProjects();

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/projects/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-bg to-purple-900/20 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Projects</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Projects &amp; Case Studies</h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Selected UI/UX and product design work — the problem, the approach, and the outcome.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="group block rounded-xl overflow-hidden border border-white/15 bg-white/5 hover:border-brand-purple/50 transition-colors"
            >
              <div className="relative aspect-video overflow-hidden">
                {p.coverImage?.url ? (
                  <Image
                    src={p.coverImage.url}
                    alt={p.coverImage.alternativeText || p.title}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-purple/30 to-black/50" />
                )}
              </div>
              <div className="p-5">
                {p.category && (
                  <span className="text-xs uppercase tracking-wide text-brand-purple">{p.category}</span>
                )}
                <h2 className="text-lg font-semibold mt-1 mb-2">{p.title}</h2>
                <p className="text-sm text-gray-400 line-clamp-3">{p.descriptionShort}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
