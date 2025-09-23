'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface BookmarkActionsProps {
  onDelete: () => void;
  onClose?: () => void;
}

export function BookmarkActions({ onDelete, onClose }: BookmarkActionsProps) {
  return (
    <div className="px-4 py-3 border-t flex items-center justify-between">
      {onClose && (
        <Button variant="outline" size="sm" onClick={onClose} className="h-8">
          <ArrowLeft className="h-3 w-3 mr-1" />
          返回
        </Button>
      )}

      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="h-8 ml-auto"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        删除书签
      </Button>
    </div>
  );
}
