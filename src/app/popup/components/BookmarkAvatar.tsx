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
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const candidates = useMemo(() => getFaviconCandidates(url), [url]);
  const src = candidates[candidateIndex];
  const initials = (title?.trim()?.[0] || 'B').toUpperCase();

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(false);
  }, [url]);

  if (!src || failed) {
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
      src={src}
      alt="favicon"
      className={`shrink-0 rounded-xl border border-gray-200/80 bg-white object-cover shadow-sm dark:border-gray-700/80 dark:bg-gray-800 ${className || ''}`}
      style={{ height: size, width: size }}
      onError={() => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((prev) => prev + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

function getFaviconCandidates(url?: string | null): string[] {
  if (!url) return [];
  try {
    const u = new URL(url);
    const domainUrl = `${u.protocol}//${u.hostname}`;
    return [
      `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(domainUrl)}`,
      `${domainUrl}/favicon.ico`,
    ];
  } catch {
    return [];
  }
}
