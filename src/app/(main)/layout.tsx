import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import Script from 'next/script';

import pkg from '../../../package.json';

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

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
      <Providers>{children}</Providers>
    </>
  );
}
