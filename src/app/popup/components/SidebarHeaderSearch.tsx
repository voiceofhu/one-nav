'use client';

import { SidebarHeader, SidebarInput } from '@/components/ui/sidebar';
import { useEffect, useRef } from 'react';

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  onSearch: () => void;
};

export function SidebarHeaderSearch({ query, onQueryChange, onSearch }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <SidebarHeader className="p-">
      <div className="text-3xl font-bold">OneNav</div>
      <div className="mt-1">
        <SidebarInput
          ref={inputRef}
          placeholder="搜索书签..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch();
          }}
          className="h-8 text-[12px]"
        />
      </div>
    </SidebarHeader>
  );
}
