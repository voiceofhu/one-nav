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
    <SidebarGroup>
      <SidebarGroupLabel>快捷</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={active === 'all'}
              onClick={onSelectAll}
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
