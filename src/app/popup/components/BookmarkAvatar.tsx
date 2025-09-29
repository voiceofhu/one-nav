'use client';

import {
  Code,
  Coins,
  Github,
  Globe,
  Languages,
  LineChart,
  type LucideIcon,
  MessageCircle,
  Puzzle,
  Terminal,
} from 'lucide-react';
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
  const isScript = Boolean(url?.trim().toLowerCase().startsWith('javascript:'));
  const builtInIcon = useMemo(() => getBuiltInIconConfig(url), [url]);
  const iconCandidates = useMemo(() => {
    if (!url || builtInIcon?.skipFavicon) return [];
    return getFaviconCandidates(url);
  }, [url, builtInIcon?.skipFavicon]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [useFallbackIcon, setUseFallbackIcon] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setUseFallbackIcon(false);
  }, [url]);

  const handleError = () => {
    setCandidateIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex < iconCandidates.length) {
        return nextIndex;
      }
      setUseFallbackIcon(true);
      return prev;
    });
  };
  const resolvedSrc = useFallbackIcon
    ? undefined
    : (iconCandidates[candidateIndex] ?? undefined);
  const initials = (title?.trim()?.[0] || 'B').toUpperCase();
  const baseWrapperClass =
    'flex shrink-0 items-center justify-center rounded-xl shadow-sm';
  const defaultWrapperClass =
    'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800';

  const renderIcon = (
    IconComponent: LucideIcon,
    options: { wrapperClass?: string; iconClass?: string } = {},
  ) => (
    <div
      className={`${baseWrapperClass} ${defaultWrapperClass} ${options.wrapperClass || ''} ${className || ''}`.trim()}
      style={{ height: size, width: size }}
    >
      <IconComponent
        className={`size-8 ${options.iconClass || 'text-gray-600 dark:text-gray-200'}`.trim()}
      />
    </div>
  );

  if (isScript) {
    return renderIcon(Code, {
      wrapperClass:
        'from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-900/10',
      iconClass: 'text-indigo-600 dark:text-indigo-300',
    });
  }

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt="favicon"
        className={`shrink-0 rounded-xl object-cover ${className || ''}`.trim()}
        style={{ height: size, width: size }}
        onError={handleError}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    );
  }

  if (builtInIcon) {
    return renderIcon(builtInIcon.Icon, {
      wrapperClass: builtInIcon.wrapperClass,
      iconClass: builtInIcon.iconClass,
    });
  }

  return (
    <div
      className={`${baseWrapperClass} ${defaultWrapperClass} text-sm font-bold text-gray-600 dark:text-gray-300 ${className || ''}`.trim()}
      style={{ height: size, width: size }}
    >
      {initials}
    </div>
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

type BuiltInIconConfig = {
  Icon: LucideIcon;
  wrapperClass?: string;
  iconClass?: string;
  skipFavicon?: boolean;
};

const SCHEME_ICON_MAP: Array<{ prefix: string; config: BuiltInIconConfig }> = [
  {
    prefix: 'chrome://',
    config: {
      Icon: Puzzle,
      wrapperClass:
        'from-sky-100 to-sky-200 dark:from-sky-900/40 dark:to-sky-900/10',
      iconClass: 'text-sky-600 dark:text-sky-300',
      skipFavicon: true,
    },
  },
  {
    prefix: 'chrome-extension://',
    config: {
      Icon: Puzzle,
      wrapperClass:
        'from-sky-100 to-sky-200 dark:from-sky-900/40 dark:to-sky-900/10',
      iconClass: 'text-sky-600 dark:text-sky-300',
      skipFavicon: true,
    },
  },
  {
    prefix: 'chrome-untrusted://',
    config: {
      Icon: Puzzle,
      wrapperClass:
        'from-sky-100 to-sky-200 dark:from-sky-900/40 dark:to-sky-900/10',
      iconClass: 'text-sky-600 dark:text-sky-300',
      skipFavicon: true,
    },
  },
  {
    prefix: 'edge://',
    config: {
      Icon: Puzzle,
      wrapperClass:
        'from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-900/10',
      iconClass: 'text-green-600 dark:text-green-300',
      skipFavicon: true,
    },
  },
  {
    prefix: 'brave://',
    config: {
      Icon: Puzzle,
      wrapperClass:
        'from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-900/10',
      iconClass: 'text-orange-600 dark:text-orange-300',
      skipFavicon: true,
    },
  },
  {
    prefix: 'vivaldi://',
    config: {
      Icon: Puzzle,
      wrapperClass:
        'from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-900/10',
      iconClass: 'text-rose-600 dark:text-rose-300',
      skipFavicon: true,
    },
  },
  {
    prefix: 'opera://',
    config: {
      Icon: Puzzle,
      wrapperClass:
        'from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-900/10',
      iconClass: 'text-red-600 dark:text-red-300',
      skipFavicon: true,
    },
  },
  {
    prefix: 'about:',
    config: {
      Icon: Globe,
      wrapperClass:
        'from-slate-100 to-slate-200 dark:from-slate-900/40 dark:to-slate-900/10',
      iconClass: 'text-slate-600 dark:text-slate-300',
      skipFavicon: true,
    },
  },
  {
    prefix: 'devtools://',
    config: {
      Icon: Terminal,
      wrapperClass:
        'from-zinc-100 to-zinc-200 dark:from-zinc-900/40 dark:to-zinc-900/10',
      iconClass: 'text-zinc-600 dark:text-zinc-300',
      skipFavicon: true,
    },
  },
  {
    prefix: 'view-source:',
    config: {
      Icon: Terminal,
      wrapperClass:
        'from-zinc-100 to-zinc-200 dark:from-zinc-900/40 dark:to-zinc-900/10',
      iconClass: 'text-zinc-600 dark:text-zinc-300',
      skipFavicon: true,
    },
  },
];

const HOST_ICON_MAP: Record<string, BuiltInIconConfig> = {
  'github.com': {
    Icon: Github,
    wrapperClass:
      'from-slate-900 to-slate-700 dark:from-slate-900 dark:to-slate-800',
    iconClass: 'text-white',
    skipFavicon: true,
  },
  'developers.weixin.qq.com': {
    Icon: MessageCircle,
    wrapperClass:
      'from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-900/10',
    iconClass: 'text-emerald-600 dark:text-emerald-300',
    skipFavicon: true,
  },
  'weixin.qq.com': {
    Icon: MessageCircle,
    wrapperClass:
      'from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-900/10',
    iconClass: 'text-emerald-600 dark:text-emerald-300',
    skipFavicon: true,
  },
  'juejin.cn': {
    Icon: Terminal,
    wrapperClass:
      'from-sky-100 to-sky-200 dark:from-sky-900/40 dark:to-sky-900/10',
    iconClass: 'text-sky-600 dark:text-sky-300',
    skipFavicon: true,
  },
  'so.csdn.net': {
    Icon: Terminal,
    wrapperClass:
      'from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-900/10',
    iconClass: 'text-red-600 dark:text-red-300',
    skipFavicon: true,
  },
  'binance.com': {
    Icon: Coins,
    wrapperClass:
      'from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-900/10',
    iconClass: 'text-amber-600 dark:text-amber-300',
    skipFavicon: true,
  },
  'dydx.exchange': {
    Icon: LineChart,
    wrapperClass:
      'from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-900/10',
    iconClass: 'text-indigo-600 dark:text-indigo-300',
    skipFavicon: true,
  },
  'coinmarketcap.com': {
    Icon: Coins,
    wrapperClass:
      'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-900/10',
    iconClass: 'text-blue-600 dark:text-blue-300',
    skipFavicon: true,
  },
  'htx.com': {
    Icon: LineChart,
    wrapperClass:
      'from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-900/10',
    iconClass: 'text-orange-600 dark:text-orange-300',
    skipFavicon: true,
  },
  'mexc.com': {
    Icon: LineChart,
    wrapperClass:
      'from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-900/10',
    iconClass: 'text-emerald-600 dark:text-emerald-300',
    skipFavicon: true,
  },
  'bit.store': {
    Icon: Coins,
    wrapperClass:
      'from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-900/10',
    iconClass: 'text-purple-600 dark:text-purple-300',
    skipFavicon: true,
  },
  'google.com': {
    Icon: Globe,
    wrapperClass:
      'from-sky-100 to-sky-200 dark:from-sky-900/40 dark:to-sky-900/10',
    iconClass: 'text-sky-600 dark:text-sky-300',
    skipFavicon: false,
  },
  'translate.google.com': {
    Icon: Languages,
    wrapperClass:
      'from-sky-100 to-sky-200 dark:from-sky-900/40 dark:to-sky-900/10',
    iconClass: 'text-sky-600 dark:text-sky-300',
    skipFavicon: false,
  },
};

function getBuiltInIconConfig(url?: string | null): BuiltInIconConfig | null {
  if (!url) return null;
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed.startsWith('javascript:')) return null;

  for (const { prefix, config } of SCHEME_ICON_MAP) {
    if (trimmed.startsWith(prefix)) {
      return config;
    }
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const normalizedHost = host.replace(/^www\./, '');
    const segments = normalizedHost.split('.');
    for (let i = 0; i < segments.length; i += 1) {
      const candidate = segments.slice(i).join('.');
      const match = HOST_ICON_MAP[candidate];
      if (match) return match;
    }
  } catch {
    return null;
  }

  return null;
}
