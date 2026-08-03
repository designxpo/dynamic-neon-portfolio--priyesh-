import type { Metadata } from 'next';
import Link from 'next/link';
import CostEstimator from '@/components/tools/CostEstimator';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';
const PATH = '/tools/project-cost-estimator';

export const metadata: Metadata = {
  title: 'Project Cost Estimator — Website, App & Software | Priyesh Mishra',
  description:
    'Free instant estimate for a website, web app, mobile app, or custom software build. Pick your scope, features, design level, and SEO/AEO add-ons to get a ballpark price and timeline in seconds.',
  keywords: [
    'website cost calculator',
    'app development cost estimator',
    'software development cost',
    'how much does a website cost',
    'web app pricing',
    'SEO cost estimate',
  ],
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: 'Free Project Cost Estimator — Website, App & Software',
    description:
      'Get an instant ballpark price and timeline for your website, app, or software project. Free, no sign-up.',
    url: `${SITE_URL}${PATH}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Project Cost Estimator — Website, App & Software',
    description: 'Instant ballpark price and timeline for your next build. Free, no sign-up.',
  },
};

// Visible FAQ — also mirrored into FAQPage JSON-LD below (answer-engine friendly).
const FAQ = [
  {
    q: 'How much does it cost to build a website?',
    a: 'A professional marketing website typically ranges from about $1,500 for a small custom site to $10,000+ for a large, feature-rich build with a CMS, integrations, and a full design system. Use the estimator above to get a ballpark for your exact scope.',
  },
  {
    q: 'How much does it cost to build a web or mobile app?',
    a: 'Web apps and SaaS dashboards usually start around $6,000 and scale with the number of screens, user accounts, payments, and integrations. Mobile apps generally start higher, around $8,000, because of platform and store requirements. The estimator breaks this down by feature.',
  },
  {
    q: 'What affects the price of a software project?',
    a: 'The biggest drivers are scope (number of screens or modules), custom features (auth, payments, dashboards, AI, integrations), how bespoke the design is, and the timeline. Rush delivery adds a premium; template-based design lowers cost.',
  },
  {
    q: 'Is this estimate a fixed quote?',
    a: 'No — it is an indicative ballpark to help you budget. Final pricing depends on detailed requirements, content readiness, and integrations. Copy your estimate link and send it through the contact form for a precise, fixed quote.',
  },
  {
    q: 'Do you optimize for SEO, AEO, and GEO?',
    a: 'Yes. Alongside design and development, projects can include an SEO foundation and AEO/GEO (answer- and generative-engine optimization) so the product is discoverable in both traditional search and AI assistants. Add these as growth add-ons in the estimator.',
  },
];

export default function ProjectCostEstimatorPage({
  searchParams,
}: {
  searchParams?: { embed?: string };
}) {
  const isEmbed = searchParams?.embed === '1';

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Project Cost Estimator',
    url: `${SITE_URL}${PATH}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Free tool to estimate the cost and timeline of a website, web app, mobile app, or custom software project.',
    author: { '@type': 'Person', name: 'Priyesh Mishra', url: SITE_URL },
    provider: { '@type': 'Person', name: 'Priyesh Mishra', url: SITE_URL },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_URL}/tools` },
      { '@type': 'ListItem', position: 3, name: 'Project Cost Estimator', item: `${SITE_URL}${PATH}` },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  // Embed mode: render just the tool so third-party <iframe>s stay compact.
  if (isEmbed) {
    return (
      <main className="min-h-screen bg-dark-bg text-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
        <CostEstimator />
        <p className="text-center text-xs text-gray-500 pb-4">
          Powered by{' '}
          <a href={`${SITE_URL}${PATH}`} target="_blank" rel="noopener" className="text-brand-purple-light hover:underline">
            Priyesh Mishra
          </a>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-bg to-purple-900/20 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-white">Tools</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Project Cost Estimator</span>
        </nav>

        <header className="mb-10 md:mb-12 max-w-3xl">
          <span className="inline-block rounded-full border border-brand-purple/40 bg-brand-purple/10 px-3 py-1 text-xs font-medium text-brand-purple-light">
            Free tool · no sign-up
          </span>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Project Cost{' '}
            <span className="bg-gradient-to-r from-brand-purple to-brand-purple-light bg-clip-text text-transparent">
              Estimator
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Ballpark the cost and timeline of a <strong className="text-gray-200">website, web app, mobile app, or custom software</strong> build in seconds. Adjust the scope below — every estimate is a shareable link you can send my way for a precise quote.
          </p>
        </header>

        <CostEstimator />

        {/* How it works — crawlable context + keywords */}
        <section className="mt-16 md:mt-20 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            How the estimate is calculated
          </h2>
          <p className="text-gray-400 leading-relaxed">
            The estimator starts from a base range for each project type — website, web app, mobile app, custom software, or design-only — then scales it by your rough size and the features you select (authentication, payments, dashboards, integrations, AI, and more). Design level and timeline apply a final multiplier, and optional SEO and AEO/GEO add-ons cover discoverability in both traditional search and AI assistants. It is an indicative ballpark to help you budget, not a fixed quote.
          </p>
        </section>

        {/* Visible FAQ — mirrors the FAQPage JSON-LD */}
        <section className="mt-14 max-w-3xl" aria-labelledby="estimator-faq">
          <h2 id="estimator-faq" className="text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Cost & pricing FAQ
          </h2>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {FAQ.map((f, i) => (
              <details key={i} className="group py-4" {...(i === 0 ? { open: true } : {})}>
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <h3 className="text-base md:text-lg font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {f.q}
                  </h3>
                  <span aria-hidden="true" className="mt-1 shrink-0 text-brand-purple-light transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-gray-400 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related — internal linking */}
        <section className="mt-14 max-w-3xl">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ready to start?
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/#contact" className="rounded-lg bg-brand-purple px-5 py-3 text-sm font-semibold text-white hover:bg-brand-purple/90 transition-colors">
              Get a fixed quote
            </Link>
            <Link href="/projects" className="rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-gray-200 hover:border-white/35 transition-colors">
              See case studies
            </Link>
            <Link href="/#services" className="rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-gray-200 hover:border-white/35 transition-colors">
              Explore services
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
