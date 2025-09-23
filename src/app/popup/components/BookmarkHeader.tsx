'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Globe2, Loader2 } from 'lucide-react';

import { BookmarkAvatar } from './BookmarkAvatar';
import { BookmarkSection } from './BookmarkSection';

interface BookmarkDetailHeaderProps {
  editing: boolean;
  title: string;
  draftTitle?: string;
  saving: boolean;
  onEdit: () => void;
  onCancel?: () => void;
  onDelete: () => void;
  onSave: () => void;
  onClose?: () => void;
}

export function BookmarkDetailHeader({
  editing,
  title,
  draftTitle,
  saving,
  onEdit,
  onCancel,
  onDelete,
  onSave,
  onClose,
}: BookmarkDetailHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2">
      <div className="flex w-full items-center justify-between gap-2 rounded-2xl border border-border/30 bg-white/90 dark:bg-gray-900/90 px-4 py-3 shadow-lg backdrop-blur-sm">
        {editing ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg px-3 text-[12px] text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              onClick={onDelete}
            >
              删除
            </Button>
            <div className="min-w-0 flex-1 truncate text-center text-[12px] font-medium text-muted-foreground">
              {draftTitle?.trim() || title}
            </div>
            <div className="flex items-center gap-2">
              {onCancel ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg px-3 text-[12px] hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={onCancel}
                  disabled={saving}
                >
                  取消
                </Button>
              ) : null}
              <Button
                size="sm"
                className="h-8 rounded-lg px-4 text-[12px] bg-blue-600 hover:bg-blue-700 text-white border-0"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : null}
                保存
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1 truncate text-[14px] font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </div>
            <div className="flex items-center gap-2">
              {onClose ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg px-3 text-[12px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  onClick={onClose}
                >
                  隐藏
                </Button>
              ) : null}
              <Button
                size="sm"
                className="h-8 rounded-lg px-4 text-[12px] bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-700"
                variant="outline"
                onClick={onEdit}
              >
                编辑
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              />
            ) : (
              <div className="space-y-0.5">
                <div className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  {detailTitle}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  {host || '未知站点'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 第二行：URL区域 */}
        {editing ? (
          <Textarea
            value={draftUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="输入链接"
            rows={3}
            className="resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
          />
        ) : url ? (
          <div className="space-y-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                网址
              </div>
              <div className="break-all text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {url}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full rounded-lg border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
              onClick={() => window.open(url, '_blank', 'noreferrer')}
            >
              <Globe2 className="mr-2 h-3.5 w-3.5" />
              打开链接
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center dark:border-gray-600 dark:bg-gray-800">
            <div className="text-[11px] text-gray-500 dark:text-gray-400">
              暂无链接
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <div className="text-[10px] text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-800">
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
