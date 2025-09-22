'use client';

import { Button } from '@/components/ui/button';
import {
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { isExtensionContext, openOptionsPage } from '@/extension/chrome';
import {
  FileUp,
  FolderPlus,
  Info,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  onAddFolder: () => void | Promise<void>;
};

type OptionsSection = 'general' | 'import-export' | 'link-health' | 'about';

const OPTION_TARGET_STORAGE_KEY = 'onenav:options:target-section';

export function FolderFooter({ onAddFolder }: Props) {
  const isExt = isExtensionContext();
  const router = useRouter();
  const goToOptions = (section: OptionsSection) => {
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(OPTION_TARGET_STORAGE_KEY, section);
    }

    if (isExt) {
      openOptionsPage(section);
      return;
    }

    try {
      router.push(`/options?section=${section}`);
    } catch {
      if (typeof window !== 'undefined') {
        window.location.assign(`/options?section=${section}`);
      }
    }
  };
  return (
    <SidebarFooter className="p-2 backdrop-blur supports-[backdrop-filter]:bg-background/30 rounded-t-2xl">
      <SidebarGroup className="p-0">
        <SidebarGroupContent>
          <div className="flex items-center justify-between gap-1 rounded-lg border border-border/40 bg-background/70 px-2 py-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => goToOptions('import-export')}
                >
                  <FileUp className="h-4 w-4" />
                  <span className="sr-only">导入 / 导出</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                导入 / 导出
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => goToOptions('link-health')}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="sr-only">链接体检</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                链接体检
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => goToOptions('general')}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">基础设置</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                基础设置
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => goToOptions('about')}
                >
                  <Info className="h-4 w-4" />
                  <span className="sr-only">关于 OneNav</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                关于 OneNav
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarGroupContent>
        <Button
          size="sm"
          className="w-full mt-2"
          onClick={() => void onAddFolder()}
        >
          <FolderPlus className="mr-1" /> 添加目录
        </Button>
      </SidebarGroup>
    </SidebarFooter>
  );
}
