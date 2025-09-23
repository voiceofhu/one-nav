'use client';

import { useEffect, useMemo, useState } from 'react';

interface BookmarkAvatarProps {
  url?: string | null;
  title?: string | null;
  size?: number;
  className?: string;
}

export function BookmarkAvatar({
  url,
  title,
  size = 48,
  className,
}: BookmarkAvatarProps) {
  const iconCandidates = useMemo(
    () => (url ? getFaviconCandidates(url) : []),
    [url],
  );
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [url]);

  const handleError = () => {
    setCandidateIndex((prev) =>
      prev < iconCandidates.length ? prev + 1 : prev,
    );
  };
  const resolvedSrc =
    iconCandidates[candidateIndex] ??
    (iconCandidates.length === 0 ? getFaviconUrl(url || '') : undefined);
  const initials = (title?.trim()?.[0] || 'B').toUpperCase();

  if (!resolvedSrc) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-sm font-bold text-gray-600 shadow-sm dark:from-gray-700 dark:to-gray-800 dark:text-gray-300 ${className || ''}`}
        style={{ height: size, width: size }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt="favicon"
      className={`shrink-0 rounded-xl object-cover ${className || ''}`}
      style={{ height: size, width: size }}
      onError={handleError}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

function getFaviconCandidates(url: string): string[] {
  try {
    const u = new URL(url);
    const domainUrl = `${u.protocol}//${u.hostname}`;
    switch (domainUrl) {
      case 'https://bandwagonhost.com':
        return ['/favicons/bwh.jpg'];
      default:
        break;
    }
    const candidates = [
      `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(domainUrl)}`,
    ];

    const seen = new Set<string>();
    return candidates.filter((icon) => {
      if (!icon || seen.has(icon)) return false;
      seen.add(icon);
      return true;
    });
  } catch {
    return [];
  }
}

function getFaviconUrl(url: string) {
  const [primary] = getFaviconCandidates(url);
  return primary ?? '/globe.svg';
}
