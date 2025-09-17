import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

import pkg from '../../package.json';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: pkg.seo.title,
  description: pkg.seo.description,
  keywords: pkg.seo.keywords,
  openGraph: {
    title: pkg.seo.og.title,
    description: pkg.seo.og.description,
    url: pkg.seo.og.url,
    type: pkg.seo.og.type as 'website',
    images: pkg.seo.og.image,
  },
  twitter: {
    card: pkg.seo.twitter.card as 'summary_large_image',
    title: pkg.seo.twitter.title,
    description: pkg.seo.twitter.description,
    images: pkg.seo.twitter.image,
  },
  metadataBase: new URL(pkg.seo.og.url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="renderer" content="webkit" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          type="image/png"
          sizes="16x16"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta
          name="theme-color"
          content="#FFFFFF"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#000000"
          media="(prefers-color-scheme: dark)"
        />
        {pkg.seo.jsonLd && (
          <Script
            id="onefile-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(pkg.seo.jsonLd) }}
            strategy="beforeInteractive"
          />
        )}
        {/* Old IE redirect (web only) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var isIE = /MSIE|Trident/.test(navigator.userAgent);
                var isOldIE = /MSIE [1-9]\\.|MSIE 10\\./.test(navigator.userAgent);
                if (isOldIE) {
                  window.location.href = '/ie.html';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
