'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCopy } from '@/hooks/use-copy';
import { Check, Copy, Globe2, Loader2 } from 'lucide-react';

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
    <div className="sticky top-0 z-10  pb-2 bg-background/95">
      <div className="flex w-full items-center justify-between gap-2 rounded-b-2xl  px-4 py-3  dark:bg-primary/10">
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
                  className="h-8 rounded-lg px-3 text-[12px] hover:bg-muted"
                  onClick={onCancel}
                  disabled={saving}
                >
                  取消
                </Button>
              ) : null}
              <Button
                size="sm"
                className="h-8 rounded-lg px-4 text-[12px]"
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
            <div className="min-w-0 flex-1 truncate text-[14px] font-semibold text-foreground">
              {title}
            </div>
            <div className="flex items-center gap-2">
              {onClose ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg px-3 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={onClose}
                >
                  隐藏
                </Button>
              ) : null}
              <Button
                size="sm"
                className="h-8 rounded-lg px-4 text-[12px]"
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
