import { Inter } from 'next/font/google';
import clsx from 'clsx';

import { StarField } from '@/components/StarField';
import { TopBar } from '@/components/TopBar';
import { Footer } from '@/components/Footer';
import { WalletPopup } from '@/components/WalletPopup';
import { NotiPopup } from '@/components/NotiPopup';
import { ErrorPopup } from '@/components/ErrorPopup';

import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: 'rgb(17, 24, 39)' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={clsx('safe-area min-h-full bg-slate-900 antialiased', inter.variable)}>
        <Providers>
          <div className="absolute inset-0 overflow-hidden">
            <div className="relative mx-auto max-w-2xl">
              <StarField className="-left-64 w-[55.0625rem] rotate-12 sm:-left-20" />
            </div>
          </div>
          <TopBar />
          {children}
          <Footer />
          <WalletPopup />
          <NotiPopup />
          <ErrorPopup />
        </Providers>
      </body>
    </html>
  );
}
