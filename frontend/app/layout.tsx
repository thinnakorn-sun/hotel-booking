import type {Metadata} from 'next';
import { Noto_Serif, Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-noto-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MAJESTIC RESERVE | Your Private Sanctuary',
  description: 'A curated selection of sanctuaries designed for the global wanderer.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${inter.variable} scroll-smooth`}>
      <body className="bg-surface font-body text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed" suppressHydrationWarning>
        <div className="gold-thread"></div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
