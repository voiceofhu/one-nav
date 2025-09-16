'use client';

import { SidebarHeader, SidebarInput } from '@/components/ui/sidebar';

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  onSearch: () => void;
};

export function SidebarHeaderSearch({ query, onQueryChange, onSearch }: Props) {
  return (
    <SidebarHeader className="p-">
      <div className="text-3xl font-bold">OneNav</div>
      <div className="mt-1">
        <SidebarInput
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
