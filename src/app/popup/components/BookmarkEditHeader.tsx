'use client';

import { Button } from '@/components/ui/button';
import { Check, Trash2 } from 'lucide-react';

interface BookmarkEditHeaderProps {
  title: string;
  saving: boolean;
  onSave: () => void;
  onDelete?: () => void;
}

export function BookmarkEditHeader({
  title,
  saving,
  onSave,
  onDelete,
}: BookmarkEditHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 px-3 text-destructive hover:text-destructive focus-visible:ring-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            删除
          </Button>
        )}
        {/* <h2 className="font-medium text-sm truncate">编辑 {title}</h2> */}
      </div>

      <Button size="sm" onClick={onSave} disabled={saving} className="h-8 px-3">
        <Check className="h-3 w-3 mr-1" />
        {saving ? '保存中...' : '完成'}
      </Button>
    </div>
  );
}
