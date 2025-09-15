'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type BookmarkNode } from '@/extension/chrome';
import { Folder, FolderOpen, List, Star, Timer } from 'lucide-react';

type Props = {
  roots: BookmarkNode[];
  activeType: 'recents' | 'all' | 'folder';
  activeFolderId?: string;
  onSelectAll: () => void;
  onSelectRecents: () => void;
  onSelectFolder: (folder: { id: string; title: string }) => void;
};

export function FoldersMenu({
  roots,
  activeType,
  activeFolderId,
  onSelectAll,
  onSelectRecents,
  onSelectFolder,
}: Props) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Folders</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeType === 'all'}
              onClick={onSelectAll}
            >
              <List />
              <span>All Bookmarks</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeType === 'recents'}
              onClick={onSelectRecents}
            >
              <Timer />
              <span>Recents</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <Star />
              <span>Favorites</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {roots.map((f) => (
            <SidebarMenuItem key={f.id}>
              <SidebarMenuButton
                isActive={activeType === 'folder' && activeFolderId === f.id}
                onClick={() => onSelectFolder({ id: f.id, title: f.title })}
              >
                {activeType === 'folder' && activeFolderId === f.id ? (
                  <FolderOpen />
                ) : (
                  <Folder />
                )}
                <span>{f.title || 'Untitled'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
