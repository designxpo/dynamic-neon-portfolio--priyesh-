import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import dynamic from 'next/dynamic';
import ChunkRecovery from '../components/ChunkRecovery';
import PremiumPreloader from '../components/PremiumPreloader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400','600','700','800'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'Next Portfolio',
  description: 'Unified Next.js app with API routes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const Chatbot = dynamic(() => import('../components/Chatbot'), { ssr: false });
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} bg-dark-bg font-sans`}>
        {/* Dev helper to auto-recover from transient chunk load errors */}
        <ChunkRecovery />
        <PremiumPreloader waitForEventName="portfolio:ready" durationMs={3800}>
          {children}
          {/* Floating chatbot - client-side only */}
          <Chatbot />
        </PremiumPreloader>
      </body>
    </html>
  );
}
