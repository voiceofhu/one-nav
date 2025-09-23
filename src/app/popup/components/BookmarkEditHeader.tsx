'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X } from 'lucide-react';

interface BookmarkEditHeaderProps {
  title: string;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onClose?: () => void;
}

export function BookmarkEditHeader({
  title,
  saving,
  onSave,
  onCancel,
  onClose,
}: BookmarkEditHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h2 className="font-medium text-sm truncate">编辑 {title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={saving}
          className="h-8 px-3"
        >
          <X className="h-3 w-3 mr-1" />
          取消
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="h-8 px-3"
        >
          <Check className="h-3 w-3 mr-1" />
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>
    </div>
  );
}
