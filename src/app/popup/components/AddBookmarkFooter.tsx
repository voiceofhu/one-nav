'use client';

import { Button } from '@/components/ui/button';
import { SidebarFooter } from '@/components/ui/sidebar';
import { Plus } from 'lucide-react';

type Props = {
  onAdd: () => void | Promise<void>;
};

export function AddBookmarkFooter({ onAdd }: Props) {
  return (
    <SidebarFooter className="p-2">
      <Button size="sm" className="w-full" onClick={() => void onAdd()}>
        <Plus className="mr-1" /> Add Bookmark
      </Button>
    </SidebarFooter>
  );
}
