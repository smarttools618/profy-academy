import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'أكاديمية بروفي | Profy Academy',
  description: 'منصة تعليمية متكاملة للسنة الخامسة والسادسة والسابعة',
  keywords: ['تعليم', 'أكاديمية', 'بروفي', 'السنة الخامسة', 'السنة السادسة', 'السنة السابعة'],
  authors: [{ name: 'Profy Academy' }],
  openGraph: {
    title: 'أكاديمية بروفي',
    description: 'منصة تعليمية متكاملة',
    locale: 'ar_TN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen antialiased">
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
