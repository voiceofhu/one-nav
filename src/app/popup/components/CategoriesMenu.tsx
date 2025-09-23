'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { getChildren, removeFolder } from '@/extension/data';
import { Folder, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { Category } from '../lib/bookmark-utils';
import { ConfirmDialog } from './ConfirmDialog';

type Props = {
  categories: Category[];
  activeId?: string;
  onSelect: (cat: Category) => void;
  onMutate?: () => void | Promise<void>;
};

export function CategoriesMenu({
  categories,
  activeId,
  onSelect,
  onMutate,
}: Props) {
  const [confirm, setConfirm] = useState<{
    folderId: string;
    label: string;
    hasAny: boolean;
    open: boolean;
  } | null>(null);
  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="text-xs">目录</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {categories.map((c) => (
            <SidebarMenuItem key={c.id}>
              <SidebarMenuButton
                isActive={activeId === c.id}
                onClick={() => onSelect(c)}
                size="sm"
                className=" cursor-pointer data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:[&>svg]:text-white pr-8"
              >
                <Folder />
                <span className="truncate ">{c.label}</span>
              </SidebarMenuButton>
              {c.mode === 'subtree' && (
                <DropdownMenu>
                  <SidebarMenuAction asChild showOnHover>
                    <DropdownMenuTrigger
                      className="hover:bg-transparent"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <MoreHorizontal
                        className={`size-5  ${activeId === c.id ? 'text-white' : 'text-muted-foreground'}`}
                      />
                    </DropdownMenuTrigger>
                  </SidebarMenuAction>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={4}
                  >
                    <DropdownMenuItem
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        try {
                          // await updateFolder(c.folderId, {
                          //   title: name.trim(),
                          // });
                          toast.success('已重命名');
                          await onMutate?.();
                        } catch (err) {
                          console.error(err);
                          toast.error('重命名失败');
                        }
                      }}
                    >
                      重命名
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          const children = await getChildren(c.folderId);
                          const hasAny = (children || []).length > 0;
                          setConfirm({
                            folderId: c.folderId,
                            label: c.label,
                            hasAny,
                            open: true,
                          });
                        } catch (err) {
                          console.error(err);
                          toast.error('删除失败，目录可能不为空');
                        }
                      }}
                    >
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
      <ConfirmDialog
        open={Boolean(confirm?.open)}
        onOpenChange={(open) => setConfirm((c) => (c ? { ...c, open } : c))}
        title="确认删除目录"
        description={
          confirm ? (
            <span>
              {confirm.hasAny
                ? '将删除该目录及其所有子项目，确定继续？'
                : '确定删除该目录吗？'}
              <br />
              目标：<strong>{confirm.label}</strong>
            </span>
          ) : null
        }
        confirmText="删除"
        onConfirm={async () => {
          if (!confirm) return;
          await removeFolder(confirm.folderId);
          toast.success('已删除目录');
          await onMutate?.();
        }}
      />
    </SidebarGroup>
  );
}
