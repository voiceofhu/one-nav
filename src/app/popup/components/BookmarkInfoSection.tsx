'use client';

import { formatToNow } from '@/lib/utils';

import { BookmarkAvatar } from './BookmarkAvatar';
import { BookmarkUrlAction } from './BookmarkUrlAction';

interface BookmarkInfoSectionProps {
  title: string;
  url: string;
  updatedAt?: number;
}

export function BookmarkInfoSection({
  title,
  url,
  updatedAt,
}: BookmarkInfoSectionProps) {
  return (
    <div className="space-y-3 w-full p-2  ">
      <div className="space-y-1 w-full bg-muted/60 rounded-md pt-2 border divide-y">
        <div className="flex justify-start items-center pb-2">
          <BookmarkAvatar url={url} className="mx-2" />
          <div className="ml-1">
            <div>
              <strong className="text-base">{title}</strong>
            </div>
            {updatedAt && (
              <div className="text-[10px] text-muted-foreground">
                上次修改时间： {formatToNow(new Date(updatedAt))}
              </div>
            )}
          </div>
        </div>
        {/* <div className="text-sm font-medium">{title}</div> */}
        {url && (
          <div className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:bg-muted-foreground/10 whitespace-break-spaces px-2 mx-1 py-2 break-all mb-2 rounded-lg">
            {/* <Globe className="h-3 w-3" /> */}
            <BookmarkUrlAction url={url} className="hover:text-foreground">
              {url}
            </BookmarkUrlAction>
          </div>
        )}
      </div>
    </div>
  );
}

function getHostFromUrl(url?: string | null) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
