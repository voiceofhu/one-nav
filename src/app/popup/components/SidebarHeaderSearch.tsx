'use client';

import { Input } from '@/components/ui/input';
import { SidebarHeader } from '@/components/ui/sidebar';

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  onSearch: () => void;
};

export function SidebarHeaderSearch({ query, onQueryChange, onSearch }: Props) {
  return (
    <SidebarHeader className="p-3">
      <div className="text-sm font-semibold">Bookmarks</div>
      <div className="mt-2">
        <Input
          placeholder="Search bookmarks…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch();
          }}
        />
      </div>
    </SidebarHeader>
  );
}
