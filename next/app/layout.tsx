import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import dynamic from 'next/dynamic';
import ChunkRecovery from '../components/ChunkRecovery';
import PremiumPreloader from '../components/PremiumPreloader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400','600','700','800'], variable: '--font-poppins' });

export async function generateMetadata(): Promise<Metadata> {
  // Fetch dynamic SEO meta from MongoDB
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL : ''}/api/seo?page=home`, { cache: 'no-store' });
    if (!res.ok) return {};
    const seo = await res.json();
    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      keywords: Array.isArray(seo.keywords) ? seo.keywords.join(', ') : seo.keywords,
      icons: seo.favicon ? { icon: seo.favicon } : undefined,
      openGraph: {
        title: seo.ogTitle || seo.metaTitle,
        description: seo.ogDescription || seo.metaDescription,
        images: seo.ogImage ? [{ url: seo.ogImage }] : [],
        url: seo.canonicalUrl,
      },
      alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    };
  } catch {
    return {};
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const Chatbot = dynamic(() => import('../components/Chatbot'), { 
    ssr: false,
    loading: () => null 
  });
  
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
