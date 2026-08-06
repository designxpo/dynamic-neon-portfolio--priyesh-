import type { Metadata } from 'next';
import Link from 'next/link';
import CostEstimator from '@/components/tools/CostEstimator';
import { slugify } from '@/lib/slug';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';
const PATH = '/tools/project-cost-estimator';

// Bump when the tool or its pricing guidance meaningfully changes (freshness signal).
const UPDATED = '2026-08-05';
const UPDATED_LABEL = 'August 5, 2026';

// Typical starting ranges (USD) shown as a comparison table — great for AI/table snippets.
const COST_ROWS = [
  { type: 'Website (marketing / brand)', range: '$2,000 – $15,000', time: '2–6 weeks' },
  { type: 'Web app / SaaS dashboard', range: '$9,000 – $90,000+', time: '6–16 weeks' },
  { type: 'Mobile app (iOS / Android)', range: '$12,000 – $150,000+', time: '8–20 weeks' },
  { type: 'Custom software / platform', range: '$15,000 – $200,000+', time: '10–24 weeks' },
  { type: 'UI/UX design only', range: '$3,000 – $30,000', time: '2–8 weeks' },
];

export const metadata: Metadata = {
  title: 'Project Cost Estimator — Website, App & Software | Priyesh Mishra',
  description:
    'Free instant cost and timeline estimate for a website, web app, mobile app, or custom software build. Pick your scope and features for a ballpark price in seconds.',
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
    description:
      'Common questions about website, web app, mobile app, and custom software development costs, timelines, and pricing.',
    inLanguage: 'en',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${PATH}`,
    url: `${SITE_URL}${PATH}`,
    name: 'Project Cost Estimator — Website, App & Software',
    description:
      'Free instant cost and timeline estimate for a website, web app, mobile app, or custom software build.',
    inLanguage: 'en',
    dateModified: UPDATED,
    isPartOf: { '@type': 'WebSite', url: SITE_URL, name: 'Priyesh Mishra' },
    about: { '@type': 'Thing', name: 'Website, app and software development pricing' },
    primaryImageOfPage: `${SITE_URL}/images/profile.png`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '#estimate-summary'],
    },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

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
          <p className="mt-3 text-xs text-gray-500">
            Last updated <time dateTime={UPDATED}>{UPDATED_LABEL}</time>
          </p>
        </header>

        {/* Top summary / key takeaway — a direct, answer-sized response for AEO/voice. */}
        <p
          id="estimate-summary"
          className="mb-10 md:mb-12 max-w-3xl rounded-xl border border-brand-purple/25 bg-brand-purple/[0.07] p-5 text-gray-200 leading-relaxed"
        >
          <strong className="text-white">In short:</strong> a professional website typically starts around{' '}
          <strong className="text-white">$2,000</strong>, web and mobile apps from{' '}
          <strong className="text-white">$9,000–$12,000</strong>, and custom software from{' '}
          <strong className="text-white">$15,000+</strong>. Final cost depends on scope, features, industry, design level,
          and timeline. Use the free estimator below for a ballpark in your local currency, then send it for a fixed quote.
        </p>

        <CostEstimator />

        {/* Typical cost ranges — comparison/data table (strong for AI + featured snippets) */}
        <section className="mt-16 md:mt-20 max-w-3xl" aria-labelledby="cost-ranges">
          <h2 id="cost-ranges" className="scroll-mt-24 text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Typical cost ranges by project type
          </h2>
          <p className="text-gray-400 leading-relaxed mb-5">
            Indicative starting ranges in USD for a skilled designer-developer. Your exact figure depends on scope, features, design level, and timeline — the estimator above tailors it and converts to your local currency.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Typical starting cost and timeline by project type (USD, indicative)</caption>
              <thead className="bg-white/[0.04] text-gray-300">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Project type</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Typical range (USD)</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {COST_ROWS.map((r) => (
                  <tr key={r.type}>
                    <th scope="row" className="px-4 py-3 font-medium text-white">{r.type}</th>
                    <td className="px-4 py-3 text-gray-300">{r.range}</td>
                    <td className="px-4 py-3 text-gray-400">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* How it works — crawlable context + keywords */}
        <section className="mt-14 max-w-3xl" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="scroll-mt-24 text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            How the estimate is calculated
          </h2>
          <p className="text-gray-400 leading-relaxed">
            The estimator starts from a base range for each project type, then applies the choices you make. Five factors drive the price:
          </p>
          <ul className="mt-4 space-y-2 text-gray-400 leading-relaxed list-disc pl-5">
            <li><strong className="text-gray-200">Project type &amp; scope</strong> — website, web app, mobile app, software, or design-only, sized by pages/screens/modules.</li>
            <li><strong className="text-gray-200">Features</strong> — auth, payments, dashboards, third-party integrations, and AI each add cost and time.</li>
            <li><strong className="text-gray-200">Design level</strong> — template-based, custom, or a full design system.</li>
            <li><strong className="text-gray-200">Timeline</strong> — a standard pace or a rush/priority premium.</li>
            <li><strong className="text-gray-200">Growth add-ons</strong> — optional SEO and AEO/GEO for discoverability in search and AI assistants.</li>
          </ul>
          <p className="mt-4 text-gray-400 leading-relaxed">
            The result is an indicative ballpark to help you budget — not a fixed quote.
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
                  <h3 id={`faq-${slugify(f.q)}`} className="scroll-mt-24 text-base md:text-lg font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
        <section className="mt-14 max-w-3xl" aria-labelledby="get-started">
          <h2 id="get-started" className="scroll-mt-24 text-xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
