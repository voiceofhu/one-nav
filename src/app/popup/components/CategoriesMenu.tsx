'use client';

import { OverflowTooltipCell } from '@/components/overflow-tooltip';
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
import { getChildren, moveNode, removeFolder } from '@/extension/data';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Folder, MoreHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [orderedCategories, setOrderedCategories] = useState(categories);
  const [confirm, setConfirm] = useState<{
    folderId: string;
    label: string;
    hasAny: boolean;
    open: boolean;
  } | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null,
  );
  const latestCategoriesRef = useRef(categories);

  useEffect(() => {
    latestCategoriesRef.current = categories;
    setOrderedCategories(categories);
  }, [categories]);

  const sortableIds = useMemo(
    () =>
      orderedCategories
        .filter((c) => c.mode === 'subtree')
        .map((category) => category.id),
    [orderedCategories],
  );

  useDndMonitor({
    onDragOver(event) {
      const activeType = event.active.data.current?.type;
      const overType = event.over?.data.current?.type;
      if (activeType === 'bookmark' && overType === 'category') {
        setHoveredCategoryId(String(event.over?.id ?? ''));
      } else {
        setHoveredCategoryId(null);
      }
    },
    onDragCancel() {
      setHoveredCategoryId(null);
      setOrderedCategories([...latestCategoriesRef.current]);
    },
    onDragEnd(event) {
      setHoveredCategoryId(null);

      const activeData = event.active.data.current as
        | { type: 'category' }
        | undefined;
      const overData = event.over?.data.current as
        | { type: 'category' }
        | undefined;

      if (!activeData || activeData.type !== 'category') {
        return;
      }

      if (!event.over || overData?.type !== 'category') {
        setOrderedCategories([...latestCategoriesRef.current]);
        return;
      }

      if (event.active.id === event.over.id) {
        return;
      }

      const activeCategory = orderedCategories.find(
        (cat) => cat.id === event.active.id,
      );
      const overCategory = orderedCategories.find(
        (cat) => cat.id === event.over?.id,
      );

      if (!activeCategory || !overCategory) {
        setOrderedCategories([...latestCategoriesRef.current]);
        return;
      }

      if (
        activeCategory.mode !== 'subtree' ||
        overCategory.mode !== 'subtree'
      ) {
        setOrderedCategories([...latestCategoriesRef.current]);
        return;
      }

      if (activeCategory.parentId !== overCategory.parentId) {
        setOrderedCategories([...latestCategoriesRef.current]);
        return;
      }

      const siblingsWithIndex = orderedCategories
        .map((cat, index) => ({ cat, index }))
        .filter(
          ({ cat }) =>
            cat.mode === 'subtree' && cat.parentId === activeCategory.parentId,
        );

      const fromIndex = siblingsWithIndex.findIndex(
        ({ cat }) => cat.id === activeCategory.id,
      );
      const toIndex = siblingsWithIndex.findIndex(
        ({ cat }) => cat.id === overCategory.id,
      );

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        setOrderedCategories([...latestCategoriesRef.current]);
        return;
      }

      const reorderedSiblings = arrayMove(
        siblingsWithIndex.map(({ cat }) => cat),
        fromIndex,
        toIndex,
      );

      const nextOrdered = [...orderedCategories];
      siblingsWithIndex.forEach(({ index }, position) => {
        nextOrdered[index] = reorderedSiblings[position];
      });
      setOrderedCategories(nextOrdered);

      void (async () => {
        try {
          await moveCategory(activeCategory, overCategory);
          await onMutate?.();
        } catch (error) {
          console.error('Failed to reorder category', error);
          setOrderedCategories([...latestCategoriesRef.current]);
          toast.error('目录排序失败，请稍后重试');
        }
      })();
    },
  });

  async function moveCategory(active: Category, over: Category) {
    const siblings = await getChildren(active.parentId);
    const activeIndex = siblings.findIndex(
      (node) => node.id === active.folderId,
    );
    const overIndex = siblings.findIndex((node) => node.id === over.folderId);

    if (activeIndex === -1 || overIndex === -1) {
      throw new Error('目标目录未找到');
    }

    const activeNode = siblings[activeIndex];
    const siblingsWithoutActive = siblings.filter(
      (_, idx) => idx !== activeIndex,
    );
    let insertIndex = siblingsWithoutActive.findIndex(
      (node) => node.id === over.folderId,
    );
    if (insertIndex === -1) {
      insertIndex = siblingsWithoutActive.length;
    }
    if (activeIndex < overIndex) {
      insertIndex += 1;
    }
    siblingsWithoutActive.splice(insertIndex, 0, activeNode);
    const newIndex = siblingsWithoutActive.findIndex(
      (node) => node.id === active.folderId,
    );

    await moveNode(active.folderId, {
      parentId: active.parentId,
      index: newIndex,
    });
  }

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="text-xs">目录</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            {orderedCategories.map((category) => (
              <CategoryMenuItem
                key={category.id}
                category={category}
                isActive={activeId === category.id}
                isBookmarkOver={hoveredCategoryId === category.id}
                onSelect={() => onSelect(category)}
                onRequestDelete={async () => {
                  try {
                    const children = await getChildren(category.folderId);
                    const hasAny = (children || []).length > 0;
                    setConfirm({
                      folderId: category.folderId,
                      label: category.label,
                      hasAny,
                      open: true,
                    });
                  } catch (err) {
                    console.error(err);
                    toast.error('删除失败，目录可能不为空');
                  }
                }}
                onRename={async () => {
                  try {
                    toast.success('已重命名');
                    await onMutate?.();
                  } catch (err) {
                    console.error(err);
                    toast.error('重命名失败');
                  }
                }}
              />
            ))}
          </SortableContext>
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

type CategoryMenuItemProps = {
  category: Category;
  isActive: boolean;
  isBookmarkOver: boolean;
  onSelect: () => void;
  onRename: () => Promise<void>;
  onRequestDelete: () => Promise<void>;
};

function CategoryMenuItem({
  category,
  isActive,
  isBookmarkOver,
  onSelect,
  onRename,
  onRequestDelete,
}: CategoryMenuItemProps) {
  if (category.mode === 'subtree') {
    return (
      <SortableCategoryRow
        category={category}
        isActive={isActive}
        isBookmarkOver={isBookmarkOver}
        onSelect={onSelect}
        onRename={onRename}
        onRequestDelete={onRequestDelete}
      />
    );
  }

  return (
    <DroppableCategoryRow
      category={category}
      isActive={isActive}
      isBookmarkOver={isBookmarkOver}
      onSelect={onSelect}
    />
  );
}

type SortableCategoryRowProps = {
  category: Category;
  isActive: boolean;
  isBookmarkOver: boolean;
  onSelect: () => void;
  onRename: () => Promise<void>;
  onRequestDelete: () => Promise<void>;
};

function SortableCategoryRow({
  category,
  isActive,
  isBookmarkOver,
  onSelect,
  onRename,
  onRequestDelete,
}: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    data: {
      type: 'category' as const,
      folderId: category.folderId,
      category,
    },
  });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : { transition };

  const baseClasses =
    'data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:[&>svg]:text-white pr-8 cursor-grab active:cursor-grabbing';
  const highlightClasses = isBookmarkOver
    ? ' ring-2 ring-primary/50 bg-primary/10'
    : '';
  const draggingClasses = isDragging
    ? ' opacity-90 shadow-md ring-2 ring-primary/50'
    : '';

  return (
    <SidebarMenuItem>
      <div ref={setNodeRef} style={style} className="relative">
        <SidebarMenuButton
          isActive={isActive}
          onClick={onSelect}
          size="sm"
          className={`${baseClasses}${highlightClasses}${draggingClasses}`}
          {...attributes}
          {...listeners}
        >
          <Folder />
          <OverflowTooltipCell
            text={category.label}
            tooltipText={category.label}
            className="w-full truncate text-[11px]"
          />
        </SidebarMenuButton>
        <DropdownMenu>
          <SidebarMenuAction asChild showOnHover>
            <DropdownMenuTrigger
              className="hover:bg-transparent"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal
                className={`size-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`}
              />
            </DropdownMenuTrigger>
          </SidebarMenuAction>
          <DropdownMenuContent side="right" align="start" sideOffset={4}>
            <DropdownMenuItem
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await onRename();
              }}
            >
              重命名
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await onRequestDelete();
              }}
            >
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SidebarMenuItem>
  );
}

type DroppableCategoryRowProps = {
  category: Category;
  isActive: boolean;
  isBookmarkOver: boolean;
  onSelect: () => void;
};

function DroppableCategoryRow({
  category,
  isActive,
  isBookmarkOver,
  onSelect,
}: DroppableCategoryRowProps) {
  const { setNodeRef } = useDroppable({
    id: category.id,
    data: {
      type: 'category' as const,
      folderId: category.folderId,
      category,
    },
  });

  const highlightClasses = isBookmarkOver
    ? ' ring-2 ring-primary/50 bg-primary/10'
    : '';

  return (
    <SidebarMenuItem>
      <div ref={setNodeRef}>
        <SidebarMenuButton
          isActive={isActive}
          onClick={onSelect}
          size="sm"
          className={`cursor-pointer data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:[&>svg]:text-white pr-8${highlightClasses}`}
        >
          <Folder />
          <OverflowTooltipCell
            text={category.label}
            tooltipText={category.label}
            className="w-full truncate text-[11px]"
          />
        </SidebarMenuButton>
      </div>
    </SidebarMenuItem>
  );
}
