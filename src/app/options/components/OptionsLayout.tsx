'use client';

import Image from 'next/image';
import Link from 'next/link';

import pkg from '../../../../package.json';
import { OptionsSecondaryActions } from './OptionsSecondaryActions';

type Props = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  title: string;
  description?: string;
};

export function OptionsLayout({
  sidebar,
  children,
  title,
  description,
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/pwa-192x192.png"
                alt="OneNav"
                width={32}
                height={32}
                className="rounded"
              />
              <div>
                <div className="text-base font-semibold leading-tight">
                  OneNav
                </div>
                <div className="text-xs text-muted-foreground leading-tight">
                  {pkg.version}
                </div>
              </div>
            </Link>
            <span className="mx-4 h-6 w-px bg-border" aria-hidden />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{title}</span>
              {description ? (
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              ) : null}
            </div>
          </div>
          <OptionsSecondaryActions />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl gap-8 px-6 py-10">
        <aside className="w-48 shrink-0">{sidebar}</aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
