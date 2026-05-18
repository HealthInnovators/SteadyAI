import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { AppTopNav } from '../components/AppTopNav';
import './globals.css';

export const metadata: Metadata = {
  applicationName: 'SteadyAI',
  metadataBase: new URL('https://www.goodhealth247.com'),
  title: 'Steady AI | Fitness, Nutrition, Community, and Reports',
  description: 'Conversational fitness and nutrition coaching with tracking, reports, community engagement, and a store.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/brand/steadyai-logo.svg'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SteadyAI'
  },
  formatDetection: {
    telephone: false
  },
  other: {
    'mobile-web-app-capable': 'yes'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f4efe8',
  colorScheme: 'light'
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
