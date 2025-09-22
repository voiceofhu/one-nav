'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Plus, Search, X } from 'lucide-react';

type Props = {
  title: string;
  query: string;
  isSearching: boolean;
  onQueryChange: (value: string) => void;
  onSubmitSearch: () => void;
  onClearSearch: () => void;
  onAddBookmark?: () => void;
};

export function ContentHeader({
  title,
  query,
  isSearching,
  onQueryChange,
  onSubmitSearch,
  onClearSearch,
  onAddBookmark,
}: Props) {
  return (
    <div className="sticky top-0 z-10 border-b border-border/60 bg-background/70 px-3 pb-2 pt-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-muted-foreground">
          <SidebarTrigger className="h-7 w-7 rounded-lg border border-transparent transition hover:bg-muted/60" />
        </div>
        <div className="flex-1 select-none text-center text-xs font-semibold text-foreground/80">
          {title}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {onAddBookmark && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-current"
              onClick={() => onAddBookmark?.()}
              title="添加书签"
            >
              <Plus className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="flex h-8 flex-1 items-center rounded-lg border border-transparent bg-[#eee] px-2.5 text-xs text-muted-foreground transition focus-within:bg-muted">
          <Search className="mr-1.5 size-3.5" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmitSearch();
            }}
            placeholder="搜索书签..."
            className="h-7 flex-1 border-none p-0 text-xs text-foreground shadow-none focus-visible:ring-0"
          />
          {query ? (
            <button
              className="inline-flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-background/40 hover:text-foreground"
              onClick={onClearSearch}
              title="清空搜索"
            >
              <X className="size-3" />
            </button>
          ) : null}
        </div>
      </div>
      {isSearching && (
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          正在搜索：
          <span className="font-medium text-foreground/80">{query}</span>
        </div>
      )}
    </div>
  );
}
