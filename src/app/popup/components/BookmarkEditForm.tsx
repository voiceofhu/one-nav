'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BookmarkEditFormProps {
  title: string;
  url: string;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
}

export function BookmarkEditForm({
  title,
  url,
  onTitleChange,
  onUrlChange,
}: BookmarkEditFormProps) {
  return (
    <div className="px-4 py-3 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bookmark-title" className="text-xs font-medium">
          标题
        </Label>
        <Input
          id="bookmark-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="书签标题"
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bookmark-url" className="text-xs font-medium">
          网址
        </Label>
        <Input
          id="bookmark-url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com"
          className="h-9 text-sm"
          type="url"
        />
      </div>
    </div>
  );
}
