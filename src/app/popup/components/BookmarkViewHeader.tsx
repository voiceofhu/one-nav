'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface BookmarkViewHeaderProps {
  title: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose?: () => void;
}

export function BookmarkViewHeader({
  title,
  onEdit,
  onDelete,
  onClose,
}: BookmarkViewHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b rounded-b-2xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )} */}
        <h2 className="font-medium text-sm truncate">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 px-3">
          <Edit className="h-3 w-3 mr-1" />
          编辑
        </Button>
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 px-3 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          删除
        </Button> */}
      </div>
    </div>
  );
}
