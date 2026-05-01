import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Unspent | Turn Wishlist Regret into Savings',
    template: '%s | Unspent',
  },
  description:
    'The social deinfluencing app that helps you save money. Add items you want, wait 72 hours, and let friends help you decide: Buy, Pass, or Dupe it.',
  keywords: ['shopping', 'savings', 'wishlist', 'deinfluencing', 'budget', 'finance'],
  authors: [{ name: 'Unspent' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Unspent',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@unspent',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
