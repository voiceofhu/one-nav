'use client';

import { Button } from '@/components/ui/button';
import {
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { isExtensionContext, openOptionsPage } from '@/extension/chrome';
import { FolderPlus, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  onAddFolder: () => void | Promise<void>;
};

export function FolderFooter({ onAddFolder }: Props) {
  const isExt = isExtensionContext();
  const router = useRouter();
  const handleOpenOptions = () => {
    if (isExt) {
      // 真正的扩展环境：打开 manifest 声明的 options 页
      openOptionsPage();
      return;
    }
    try {
      router.push('/options');
    } catch {
      // window.location.assign('/options');
    }
  };
  return (
    <SidebarFooter className="p-2  backdrop-blur supports-[backdrop-filter]:bg-background/30 rounded-t-2xl">
      <SidebarGroup className="p-0">
        <Button size="sm" className="w-full" onClick={() => void onAddFolder()}>
          <FolderPlus className="mr-1" /> 添加目录
        </Button>

        <SidebarGroupContent>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={handleOpenOptions}
          >
            <Settings className="mr-2 h-4 w-4" />
          </Button>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarFooter>
  );
}
