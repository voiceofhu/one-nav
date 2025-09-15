'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Folder } from 'lucide-react';

export type Category = {
  id: string;
  label: string;
  folderId: string; // referenced folder id backing this category
  mode: 'root-direct' | 'subtree';
};

type Props = {
  categories: Category[];
  activeId?: string;
  onSelect: (cat: Category) => void;
};

export function CategoriesMenu({ categories, activeId, onSelect }: Props) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>目录</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {categories.map((c) => (
            <SidebarMenuItem key={c.id}>
              <SidebarMenuButton
                isActive={activeId === c.id}
                onClick={() => onSelect(c)}
                className="data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:[&>svg]:text-white"
              >
                <Folder />
                <span>{c.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
