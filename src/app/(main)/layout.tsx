'use client';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import Script from 'next/script';
import { useEffect } from 'react';

import pkg from '../../../package.json';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const ua = navigator.userAgent;
    const isOldIE = /MSIE [1-9]\.|MSIE 10\./.test(ua);
    if (isOldIE) {
      window.location.href = '/ie.html';
    }
  }, []);
  return (
    <>
      {pkg.seo.jsonLd && (
        <Script
          id="onefile-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pkg.seo.jsonLd) }}
          strategy="afterInteractive"
        />
      )}

      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <Header />
        {children}
        <Footer />
      </div>
    </>
  );
}
