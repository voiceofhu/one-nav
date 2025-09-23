'use client';

import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface BookmarkViewHeaderProps {
  title: string;
  onEdit: () => void;
}

export function BookmarkViewHeader({ title, onEdit }: BookmarkViewHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-sm truncate">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 px-3">
          <Edit className="h-3 w-3 mr-1" />
          编辑
        </Button>
      </div>
    </div>
  );
}
