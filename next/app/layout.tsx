import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import dynamic from 'next/dynamic';
import ChunkRecovery from '../components/ChunkRecovery';
import PremiumPreloader from '../components/PremiumPreloader';

const Chatbot = dynamic(() => import('../components/Chatbot'), {
  ssr: false,
  loading: () => null
});

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-poppins' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';
const DEFAULT_TITLE = 'Priyesh Mishra — UI/UX Designer & Performance Marketing Expert';
const DEFAULT_DESCRIPTION = 'Priyesh Mishra is a UI/UX designer, developer, and performance marketing expert crafting high-converting digital products, brand experiences, and data-driven growth campaigns.';
const DEFAULT_KEYWORDS = 'Priyesh Mishra, UI/UX Designer, UI/UX Developer, Performance Marketing Expert, Performance Marketer, Growth Marketing, Digital Marketing, Product Designer, Web Designer, Frontend Developer, Brand Designer, Social Media Strategist, Conversion Optimization, SaaS Design, Fintech Design, Portfolio';

export async function generateMetadata(): Promise<Metadata> {
  const defaults: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
      default: DEFAULT_TITLE,
      template: '%s | Priyesh Mishra',
    },
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    authors: [{ name: 'Priyesh Mishra', url: SITE_URL }],
    creator: 'Priyesh Mishra',
    publisher: 'Priyesh Mishra',
    applicationName: 'Priyesh Mishra Portfolio',
    category: 'Design',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    alternates: {
      canonical: SITE_URL,
    },
    icons: {
      icon: '/icon.svg',
      shortcut: '/icon.svg',
      apple: '/images/favicon.png',
    },
    openGraph: {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      siteName: 'Priyesh Mishra',
      url: SITE_URL,
      locale: 'en_US',
      images: [
        { url: '/images/profile.png', width: 800, height: 800, alt: 'Priyesh Mishra — UI/UX Designer & Performance Marketing Expert' },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: ['/images/profile.png'],
      creator: '@priyeshmishra',
    },
  };

  try {
    const apiBase = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const res = await fetch(`${apiBase}/api/seo?page=home`, { cache: 'no-store' });
    if (!res.ok) return defaults;
    const seo = await res.json();
    const canonical = seo.canonicalUrl || SITE_URL;
    return {
      ...defaults,
      title: seo.metaTitle || DEFAULT_TITLE,
      description: seo.metaDescription || DEFAULT_DESCRIPTION,
      keywords: Array.isArray(seo.keywords) ? seo.keywords.join(', ') : (seo.keywords || DEFAULT_KEYWORDS),
      icons: seo.favicon ? { icon: seo.favicon } : defaults.icons,
      alternates: { canonical },
      openGraph: {
        ...defaults.openGraph,
        title: seo.ogTitle || seo.metaTitle || DEFAULT_TITLE,
        description: seo.ogDescription || seo.metaDescription || DEFAULT_DESCRIPTION,
        images: seo.ogImage ? [{ url: seo.ogImage }] : (defaults.openGraph?.images || []),
        url: canonical,
      },
    };
  } catch {
    return defaults;
  }
}

// JSON-LD structured data — Person + ProfessionalService
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Priyesh Mishra',
  url: SITE_URL,
  image: `${SITE_URL}/images/profile.png`,
  jobTitle: ['UI/UX Designer', 'UI/UX Developer', 'Performance Marketing Expert'],
  description: DEFAULT_DESCRIPTION,
  sameAs: [
    'https://priyeshmishra1602.medium.com',
  ],
  knowsAbout: [
    'UI Design',
    'UX Design',
    'Product Design',
    'Web Development',
    'Performance Marketing',
    'Growth Marketing',
    'Conversion Rate Optimization',
    'Brand Identity',
    'Social Media Strategy',
    'Design Systems',
  ],
};

const professionalServiceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Priyesh Mishra — Design & Performance Marketing',
  url: SITE_URL,
  image: `${SITE_URL}/images/profile.png`,
  description: DEFAULT_DESCRIPTION,
  areaServed: 'Worldwide',
  serviceType: [
    'UI/UX Design',
    'Product Design',
    'Web & App Development',
    'Performance Marketing',
    'Growth Marketing',
    'Brand Identity Design',
    'Social Media Strategy',
  ],
  provider: {
    '@type': 'Person',
    name: 'Priyesh Mishra',
    url: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} bg-dark-bg font-sans scroll-smooth`}>
        {/* Dev helper to auto-recover from transient chunk load errors */}
        <ChunkRecovery />
        <PremiumPreloader waitForEventName="portfolio:ready" durationMs={2000}>
          {children}
          {/* Floating chatbot - client-side only */}
          <Chatbot />
        </PremiumPreloader>
      </body>
    </html>
  );
}
