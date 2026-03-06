import type { Metadata } from 'next';
import { Providers } from './providers';
import { AppTopNav } from '../components/AppTopNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Steady AI | Fitness, Nutrition, Community, and Reports',
  description: 'Conversational fitness and nutrition coaching with tracking, reports, community engagement, and a store.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <AppTopNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
