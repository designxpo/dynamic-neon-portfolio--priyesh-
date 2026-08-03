import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

export const metadata: Metadata = {
  title: 'Free Tools — Priyesh Mishra',
  description:
    'Free tools for planning a website, app, or software project — starting with an instant project cost and timeline estimator.',
  alternates: { canonical: `${SITE_URL}/tools` },
  openGraph: {
    title: 'Free Tools — Priyesh Mishra',
    description: 'Free tools for planning your next website, app, or software project.',
    url: `${SITE_URL}/tools`,
    type: 'website',
  },
};

const TOOLS = [
  {
    href: '/tools/project-cost-estimator',
    name: 'Project Cost Estimator',
    desc: 'Ballpark the price and timeline of a website, web app, mobile app, or software build in seconds.',
    tag: 'Pricing',
  },
];

export default function ToolsIndexPage() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: TOOLS.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}${t.href}`,
      name: t.name,
    })),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-bg to-purple-900/20 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Tools</span>
        </nav>

        <header className="mb-12 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Free{' '}
            <span className="bg-gradient-to-r from-brand-purple to-brand-purple-light bg-clip-text text-transparent">
              Tools
            </span>
          </h1>
          <p className="text-lg text-gray-400">
            Practical, no-sign-up tools to help you plan a website, app, or software project.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group block rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:border-brand-purple/50 transition-colors"
            >
              <span className="text-xs uppercase tracking-wide text-brand-purple">{t.tag}</span>
              <h2 className="mt-2 text-xl font-semibold text-white group-hover:text-brand-purple-light transition-colors">
                {t.name}
              </h2>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">{t.desc}</p>
              <span className="mt-4 inline-block text-sm font-medium text-brand-purple-light">Open tool →</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
