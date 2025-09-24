'use client';

import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { SidebarFooter, SidebarGroup } from '@/components/ui/sidebar';
import {
  isExtensionContext,
  openOptionsPage,
  openShortcutSettings,
} from '@/extension/chrome';
import {
  FileUp,
  FolderPlus,
  Info,
  Keyboard,
  List,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactNode } from 'react';

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

  const quickActions: Array<{
    icon: ReactNode;
    label: string;
    onClick: () => void;
  }> = [
    {
      icon: <List className="h-4 w-4" />,
      label: '基础设置',
      onClick: () => goToOptions('general'),
    },
    {
      icon: <Keyboard className="h-4 w-4" />,
      label: '快捷键设置',
      onClick: () => {
        if (!isExt) {
          goToOptions('general');
          return;
        }
        void openShortcutSettings().catch((error) => {
          console.error('Failed to open shortcut settings', error);
          goToOptions('general');
        });
      },
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: '链接体检',
      onClick: () => goToOptions('link-health'),
    },
    {
      icon: <FileUp className="h-4 w-4" />,
      label: '导入 / 导出',
      onClick: () => goToOptions('import-export'),
    },
    {
      icon: <Info className="h-4 w-4" />,
      label: '关于 OneNav',
      onClick: () => goToOptions('about'),
    },
  ];

  return (
    <SidebarFooter className="rounded-t-2xl p-2 backdrop-blur supports-[backdrop-filter]:bg-background/30">
      <SidebarGroup className="p-0">
        <div className="flex items-center justify-between gap-1">
          <Button
            size="sm"
            className="px-2 py-1 flex-1 "
            onClick={() => void onAddFolder()}
          >
            <FolderPlus className="size-4" /> 添加目录
          </Button>
          <HoverCard openDelay={75} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-muted text-muted-foreground hover:text-foreground"
                aria-label="设置"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent
              side="top"
              align="start"
              className="w-[140px] space-y-2 p-2"
            >
              <div className="text-xs font-medium text-muted-foreground">
                设置
              </div>
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
                  >
                    {action.icon}
                    <span className="flex-1 text-left">{action.label}</span>
                  </button>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </SidebarGroup>
    </SidebarFooter>
  );
}
