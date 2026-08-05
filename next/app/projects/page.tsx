import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getProjects } from '@/lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

export const revalidate = 3600;

const UPDATED = '2026-08-05';
const UPDATED_LABEL = 'August 5, 2026';

// Short, extractable Q&A to lift answer-engine coverage on this index page.
const PROJECTS_FAQ = [
  {
    q: 'What kind of projects does Priyesh Mishra work on?',
    a: 'Priyesh designs and builds websites, web apps, mobile apps, and custom software across SaaS, fintech, eCommerce, and D2C — covering UX research, UI design, design systems, and front-end development.',
  },
  {
    q: 'What do these case studies show?',
    a: 'Each case study lays out the problem, the approach, and the outcome — the design decisions made and the impact they had. Open any project to see the full story.',
  },
  {
    q: 'How do I start a project like these?',
    a: 'Get a ballpark with the free project cost estimator, then use the contact form to request a fixed quote and kick off the work.',
  },
];

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
    images: [{ url: `${SITE_URL}/images/profile.png`, width: 800, height: 800, alt: 'Priyesh Mishra — Projects & Case Studies' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects & Case Studies — Priyesh Mishra',
    description: 'Selected UI/UX and product design case studies by Priyesh Mishra.',
    images: [`${SITE_URL}/images/profile.png`],
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE_URL}/projects` },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/projects`,
    url: `${SITE_URL}/projects`,
    name: 'Projects & Case Studies — Priyesh Mishra',
    description:
      'UI/UX design and product case studies by Priyesh Mishra across SaaS, fintech, eCommerce, and D2C.',
    inLanguage: 'en',
    dateModified: UPDATED,
    isPartOf: { '@type': 'WebSite', url: SITE_URL, name: 'Priyesh Mishra' },
    about: { '@type': 'Person', name: 'Priyesh Mishra', url: SITE_URL },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'en',
    mainEntity: PROJECTS_FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-bg to-purple-900/20 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Projects</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Projects &amp; Case Studies</h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            A selection of UI/UX design and development work by Priyesh Mishra — websites, web apps, and product interfaces for <strong className="text-white">SaaS, fintech, eCommerce, and D2C</strong> brands. Each case study covers the problem, the approach, and the outcome.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Last updated <time dateTime={UPDATED}>{UPDATED_LABEL}</time>
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

        {/* FAQ — question headings + answers (answer-engine friendly) */}
        <section className="mt-16 md:mt-20 max-w-3xl" aria-labelledby="projects-faq">
          <h2 id="projects-faq" className="scroll-mt-24 text-2xl md:text-3xl font-bold mb-6">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {PROJECTS_FAQ.map((f, i) => (
              <div key={i} className="py-4">
                <h3 id={`faq-${f.q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`} className="scroll-mt-24 text-base md:text-lg font-semibold text-white">
                  {f.q}
                </h3>
                <p className="mt-2 text-gray-400 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tools/project-cost-estimator" className="rounded-lg bg-brand-purple px-5 py-3 text-sm font-semibold text-white hover:bg-brand-purple/90 transition-colors">
              Estimate your project cost
            </Link>
            <Link href="/#contact" className="rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-gray-200 hover:border-white/35 transition-colors">
              Start a project
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
