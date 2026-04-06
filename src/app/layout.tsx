import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/toaster';
import { DynamicTitle } from '@/components/DynamicTitle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'שמש - מערכת ניהול בית כנסת',
  description: 'מערכת ניהול מקומית לבתי כנסת - עליות, תרומות, וחברים',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Apply animation preference before paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem('shamash-animations') === 'false') {
              document.documentElement.classList.add('no-animations');
            }
          } catch(e) {}
        `}} />
      </head>
      <body className={inter.className}>
        <Providers>
          <DynamicTitle />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
