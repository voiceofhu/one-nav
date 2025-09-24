'use client';

import { openUrlInNewTab, runBookmarklet } from '@/extension/chrome';
import { cn } from '@/lib/utils';
import { MouseEvent, ReactNode, useMemo } from 'react';
import { toast } from 'sonner';

export function isJavascriptUrl(url: string) {
  return url.trim().toLowerCase().startsWith('javascript:');
}

export function stripJavascriptPrefix(url: string) {
  return url.replace(/^javascript:\s*/i, '');
}

const SPECIAL_PROTOCOL_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'chrome-untrusted://',
  'edge://',
  'brave://',
  'vivaldi://',
  'opera://',
  'about:',
  'devtools://',
  'view-source:',
];

export function requiresChromeTabsNavigation(url: string) {
  const normalized = url.trim().toLowerCase();
  return SPECIAL_PROTOCOL_PREFIXES.some((prefix) =>
    normalized.startsWith(prefix),
  );
}

export function toScriptErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : null;
  if (!raw) return '脚本执行失败，请稍后再试';
  if (raw.includes('Chrome APIs unavailable')) {
    return '脚本执行失败：当前环境无法使用 Chrome 扩展 API';
  }
  if (raw.includes('Chrome tabs API unavailable')) {
    return '脚本执行失败：无法访问当前标签页';
  }
  if (raw.includes('Active tab unavailable')) {
    return '脚本执行失败：未找到活动标签页';
  }
  if (raw.includes('Bookmarklet execution blocked on restricted page')) {
    return '脚本执行失败：浏览器受限页面不允许执行脚本';
  }
  if (raw.includes('No available API to execute bookmarklet')) {
    return '脚本执行失败：浏览器不支持脚本注入';
  }
  return raw;
}

export function toLinkErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : null;
  if (!raw) return '链接打开失败，请稍后再试';
  if (raw.includes('Chrome APIs unavailable')) {
    return '链接打开失败：当前环境无法使用 Chrome 扩展 API';
  }
  if (raw.includes('Chrome tabs API unavailable')) {
    return '链接打开失败：无法创建浏览器标签页';
  }
  if (raw.includes('Failed to open URL in new tab')) {
    return '链接打开失败：浏览器拒绝打开该地址';
  }
  return raw;
}

type BookmarkUrlActionProps = {
  url: string;
  className?: string;
  children: ReactNode;
};

export function BookmarkUrlAction({
  url,
  className,
  children,
}: BookmarkUrlActionProps) {
  const actionType = useMemo(() => {
    if (isJavascriptUrl(url)) return 'script' as const;
    if (requiresChromeTabsNavigation(url)) return 'special' as const;
    return 'link' as const;
  }, [url]);

  async function handleBookmarklet(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const code = stripJavascriptPrefix(url);
    if (!code) return;
    try {
      await runBookmarklet(code);
    } catch (error) {
      console.error('Failed to execute bookmarklet', error);
      toast.error(toScriptErrorMessage(error));
    }
  }

  async function handleSpecialUrl(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const targetUrl = url.trim();
    if (!targetUrl) return;
    try {
      await openUrlInNewTab(targetUrl);
    } catch (error) {
      console.error('Failed to open special bookmark URL', error);
      toast.error(toLinkErrorMessage(error));
    }
  }

  if (actionType === 'script') {
    return (
      <button
        type="button"
        onClick={handleBookmarklet}
        className={cn(
          'text-left transition-colors flex items-center gap-1 bg-transparent text-current cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        )}
      >
        {children}
      </button>
    );
  }

  if (actionType === 'special') {
    return (
      <button
        type="button"
        onClick={handleSpecialUrl}
        className={cn(
          'text-left transition-colors flex items-center gap-1 bg-transparent text-current cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'hover:text-foreground text-left transition-colors flex items-center gap-1',
        className,
      )}
    >
      {children}
    </a>
  );
}
