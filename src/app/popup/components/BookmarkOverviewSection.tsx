'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCopy } from '@/hooks/use-copy';

import { BookmarkAvatar } from './BookmarkAvatar';
import { BookmarkSection } from './BookmarkSection';

interface BookmarkOverviewSectionProps {
  editing: boolean;
  detailTitle: string;
  draftTitle: string;
  draftUrl: string;
  url: string;
  host: string;
  updatedAt?: number;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
}

export function BookmarkOverviewSection({
  editing,
  detailTitle,
  draftTitle,
  draftUrl,
  url,
  host,
  updatedAt,
  onTitleChange,
  onUrlChange,
}: BookmarkOverviewSectionProps) {
  const { isCopied, copy } = useCopy();
  return (
    <BookmarkSection>
      <div className="space-y-3">
        {/* 第一行：图标、标题和主机 */}
        <div className="flex items-center gap-3">
          <BookmarkAvatar url={url} title={detailTitle} size={40} />
          <div className="min-w-0 flex-1">
            {editing ? (
              <Input
                value={draftTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="输入名称"
                className="h-9 rounded-lg text-[13px] font-semibold"
              />
            ) : (
              <div className="space-y-0.5">
                <div className="text-[14px] font-semibold text-foreground leading-tight">
                  {detailTitle}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {host || '未知站点'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 第二行：URL区域 */}
        <div className="space-y-1 py-2">
          {url ? (
            <div className=" px-2 break-all cursor-pointer text-[11px]  text-foreground leading-relaxed whitespace-pre-wrap hover:bg-muted rounded-md py-1">
              <div className="">{url}</div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-muted bg-muted/30 px-3 py-4 text-center">
              <div className="text-[11px] text-muted-foreground">暂无链接</div>
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          上次修改：{formatDate(updatedAt)}
        </div>
      </div>
    </BookmarkSection>
  );
}

function formatDate(ts?: number) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleDateString();
  } catch {
    return '—';
  }
}
