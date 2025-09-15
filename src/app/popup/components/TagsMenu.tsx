'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export type TagItem = { name: string; count: number };

type Props = {
  tags: TagItem[];
  activeName?: string;
  onSelect: (tag: TagItem) => void;
};

export function TagsMenu({ tags, activeName, onSelect }: Props) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>标签</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {tags.map((t) => (
            <SidebarMenuItem key={t.name}>
              <SidebarMenuButton
                isActive={activeName === t.name}
                onClick={() => onSelect(t)}
                className="data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:[&>svg]:text-white"
              >
                <span>#{t.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {t.count}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
