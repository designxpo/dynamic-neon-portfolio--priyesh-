import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import ChunkRecovery from '../components/ChunkRecovery';
import PremiumPreloader from '../components/PremiumPreloader';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-5PD8KLC8';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-VHJYL13CX1';

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
      icon: '/images/favicon.png',
      shortcut: '/images/favicon.png',
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
      keywords: Array.isArray(seo.metaKeywords)
        ? seo.metaKeywords.join(', ')
        : (seo.metaKeywords || seo.keywords || DEFAULT_KEYWORDS),
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
  '@id': `${SITE_URL}/#person`,
  name: 'Priyesh Mishra',
  alternateName: ['Priyesh', 'Priyesh Mishra Designer', 'Priyesh Mishra UI/UX'],
  givenName: 'Priyesh',
  familyName: 'Mishra',
  url: SITE_URL,
  image: `${SITE_URL}/images/profile.png`,
  jobTitle: ['UI/UX Designer', 'UI/UX Developer', 'Performance Marketing Expert'],
  description: DEFAULT_DESCRIPTION,
  sameAs: [
    'https://linkedin.com/in/priyeshmishra16',
    'https://instagram.com/designxpo.in',
    'https://twitter.com/mepriyeshm',
    'https://priyeshmishra1602.medium.com',
  ],
  knowsAbout: [
    'UI Design',
    'UX Design',
    'Product Design',
    'UX Strategy',
    'Product Management',
    'Web Development',
    'Next.js',
    'Supabase',
    'Performance Marketing',
    'Meta Ads',
    'Google Ads',
    'WhatsApp Automation',
    'Conversion Rate Optimization',
    'Brand Identity',
    'Social Media Strategy',
    'Design Systems',
  ],
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Galgotias University',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New Delhi',
    addressRegion: 'DL',
    addressCountry: 'IN',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Scaletrix.AI',
    url: 'https://scaletrix.ai',
  },
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Product Design Consultant & UX Strategist',
    occupationLocation: {
      '@type': 'City',
      name: 'New Delhi',
    },
    skills: 'UX Strategy, Product Design, WhatsApp Automation, Performance Marketing, Next.js',
  },
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
        {/* Google Tag Manager */}
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
        {/* End Google Tag Manager */}
        {/* Google tag (gtag.js) — GA4 */}
        <Script
          id="ga4-loader"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`,
          }}
        />
        {/* End Google tag (gtag.js) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: SITE_URL,
            name: 'Priyesh Mishra',
            description: DEFAULT_DESCRIPTION,
            publisher: { '@id': `${SITE_URL}/#person` },
            inLanguage: 'en',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          }) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            '@id': 'https://mindbird.ai/#app',
            name: 'Mindbird.ai',
            url: 'https://mindbird.ai',
            applicationCategory: 'BusinessApplication',
            applicationSubCategory: 'Marketing Automation',
            operatingSystem: 'Web',
            description:
              'WhatsApp sales automation platform for D2C and SaaS brands — CTWA campaigns, chat flows, and conversion tracking.',
            creator: { '@id': `${SITE_URL}/#person` },
            contributor: { '@id': `${SITE_URL}/#person` },
            publisher: {
              '@type': 'Organization',
              name: 'Scaletrix.AI',
              url: 'https://scaletrix.ai',
            },
            offers: {
              '@type': 'Offer',
              category: 'SaaS',
            },
          }) }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} bg-dark-bg font-sans scroll-smooth`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
