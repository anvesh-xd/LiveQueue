import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import BootstrapClient from '@/components/BootstrapClient';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LiveQueue — Real-time Song Requests',
  description: 'A modern way for patrons to request songs and DJs to manage their queue. Real-time. Effortless.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
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
