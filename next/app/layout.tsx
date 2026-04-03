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

export async function generateMetadata(): Promise<Metadata> {
  // Fetch admin-configured site metadata; fall back to safe defaults if unavailable
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://priyeshmishra.com';
  const defaults: Metadata = {
    metadataBase: new URL(siteUrl),
    title: 'Priyesh Mishra | UI/UX Designer',
    description: 'Portfolio of Priyesh Mishra, showcasing UI/UX design projects, case studies, and modern web interfaces.',
    keywords: 'Priyesh Mishra, Portfolio, UI/UX Designer, UI Design, UX Design, Web Design, Interaction Design, User Experience, User Interface',
    authors: [{ name: 'Priyesh Mishra' }],
    robots: 'index, follow',
    icons: {
      icon: '/icon.svg',
      shortcut: '/icon.svg',
      apple: '/images/favicon.png',
    },
    openGraph: {
      title: 'Priyesh Mishra | UI/UX Designer',
      description: 'Explore Priyesh Mishra’s portfolio showcasing UI/UX design projects, case studies, and modern web interfaces.',
      siteName: 'Priyesh Mishra',
      images: [
        { url: '/images/profile.png', width: 800, height: 800, alt: 'Priyesh Mishra — UI/UX Designer' },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Priyesh Mishra | UI/UX Designer',
      description: 'Check out Priyesh Mishra’s UI/UX design portfolio with case studies and modern web interfaces.',
      images: ['/images/profile.png'],
    },
  };

  try {
    // Must use an absolute URL for server-side fetch. Fall back to localhost in dev.
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const res = await fetch(`${baseUrl}/api/admin/siteMeta`, { cache: 'no-store' });
    if (!res.ok) return defaults;
    const meta = await res.json();
    const m: Metadata = {
      ...defaults,
      title: meta?.title ?? defaults.title,
      description: meta?.description ?? defaults.description,
      keywords: meta?.keywords ?? defaults.keywords,
      authors: meta?.authors ?? defaults.authors,
      robots: meta?.robots ?? defaults.robots,
      icons: meta?.icons ?? defaults.icons,
      openGraph: meta?.openGraph ? { ...meta.openGraph } : defaults.openGraph,
      twitter: meta?.twitter ? { ...meta.twitter } : defaults.twitter,
    };
    return m;
  } catch {
    return defaults;
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} bg-dark-bg font-sans`}>
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
