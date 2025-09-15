'use client';

import { type BookmarkNode } from '@/extension/data';
import { Code2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = {
  items: BookmarkNode[];
  showLoading: boolean;
  isExt: boolean;
};

export function BookmarksList({ items, showLoading, isExt }: Props) {
  if (!isExt) {
    return (
      <div>
        <div className="text-sm text-orange-600 mb-2">
          非扩展环境预览：Chrome API 不可用
        </div>
        {renderList(items, showLoading)}
      </div>
    );
  }
  return renderList(items, showLoading);
}

function renderList(items: BookmarkNode[], showLoading: boolean) {
  if (showLoading) {
    return <div className="text-sm text-muted-foreground">加载中...</div>;
  }
  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">暂无书签</div>;
  }
  return (
    <ul className="space-y-1">
      {items.map((b) => (
        <BookmarkRow key={b.id} node={b} />
      ))}
    </ul>
  );
}

function BookmarkRow({ node }: { node: BookmarkNode }) {
  const url = node.url || '';
  const isScript = url.trim().toLowerCase().startsWith('javascript:');
  const title = node.title || url;
  const host = useMemo(() => formatHost(url), [url]);

  return (
    <li className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent/60">
      <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        <BookmarkIcon url={url} isScript={isScript} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium leading-5 text-foreground">
          {title}
        </div>
        <a
          className="truncate block text-[12px] text-muted-foreground hover:underline"
          href={url}
          title={url}
          target="_blank"
          rel="noreferrer"
        >
          {isScript ? 'javascript:' : host}
        </a>
      </div>
    </li>
  );
}

function BookmarkIcon({ url, isScript }: { url: string; isScript: boolean }) {
  const initial = useMemo(
    () => (isScript ? null : getFaviconUrl(url)),
    [isScript, url],
  );
  const [src, setSrc] = useState<string | null>(initial);

  if (isScript) {
    return <Code2 className="h-5 w-5 text-purple-600" aria-hidden />;
  }

  const handleError = () => {
    // try DuckDuckGo as second source then fallback
    const ddg = getDuckDuckGoIcon(url);
    if (src && src !== ddg) setSrc(ddg);
    else setSrc('/globe.svg');
  };

  return (
    <img
      className="h-5 w-5"
      src={src || '/globe.svg'}
      alt="favicon"
      onError={handleError}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

function getFaviconUrl(url: string) {
  try {
    const u = new URL(url);
    const domainUrl = `${u.protocol}//${u.hostname}`;
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(domainUrl)}`;
  } catch {
    return '/globe.svg';
  }
}

function getDuckDuckGoIcon(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname;
    return `https://icons.duckduckgo.com/ip3/${host}.ico`;
  } catch {
    return '/globe.svg';
  }
}

function formatHost(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').slice(0, 80);
  }
}
