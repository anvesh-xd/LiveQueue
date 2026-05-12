import type { Metadata } from 'next';
import { Instrument_Serif, Manrope, JetBrains_Mono } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import BootstrapClient from '@/components/BootstrapClient';

const display = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const body = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    try {
      return new URL(explicit);
    } catch {
      /* fall through */
    }
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL('http://localhost:3000');
}

const description =
  'Skip the queue. Live, editorial-grade song requests for nightclubs and venues — patrons request from their phone, DJs run the floor in real time.';

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: 'LiveQueue — Skip the Queue',
    template: '%s · LiveQueue',
  },
  description,
  openGraph: {
    type: 'website',
    siteName: 'LiveQueue',
    title: 'LiveQueue — Skip the Queue',
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LiveQueue',
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
        <BootstrapClient />
      </body>
    </html>
  );
}
