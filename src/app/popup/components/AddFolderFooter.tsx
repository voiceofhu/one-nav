'use client';

import { Button } from '@/components/ui/button';
import {
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { FolderPlus, Settings } from 'lucide-react';

type Props = {
  onAddFolder: () => void | Promise<void>;
  onOpenSettings?: () => void | Promise<void>;
};

export function AddFolderFooter({ onAddFolder, onOpenSettings }: Props) {
  return (
    <SidebarFooter className="p-2  backdrop-blur supports-[backdrop-filter]:bg-background/30 rounded-t-2xl">
      <SidebarGroup className="p-0">
        <Button size="sm" className="w-full" onClick={() => void onAddFolder()}>
          <FolderPlus className="mr-1" /> 添加目录
        </Button>
        <SidebarGroupLabel className="text-xs text-muted-foreground">
          Settings
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => void onOpenSettings?.()}
          >
            <Settings className="mr-2 h-4 w-4" /> 进入设置
          </Button>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarFooter>
  );
}
