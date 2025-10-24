import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next Portfolio',
  description: 'Unified Next.js app with API routes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
