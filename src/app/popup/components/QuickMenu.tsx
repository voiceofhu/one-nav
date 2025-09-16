'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { List, Timer } from 'lucide-react';

type Props = {
  active: 'all' | 'recents' | null;
  onSelectAll: () => void;
  onSelectRecents: () => void;
};

export function QuickMenu({ active, onSelectAll, onSelectRecents }: Props) {
  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="text-xs">快捷</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={active === 'all'}
              onClick={onSelectAll}
              size="sm"
              className="data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:[&>svg]:text-white"
            >
              <List />
              <span>全部书签</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={active === 'recents'}
              onClick={onSelectRecents}
              size="sm"
              className="data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:[&>svg]:text-white"
            >
              <Timer />
              <span>最近</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
