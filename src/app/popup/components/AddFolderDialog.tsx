'use client';

import { OverflowTooltipCell } from '@/components/overflow-tooltip';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type BookmarkNode, addFolder } from '@/extension/data';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { popupTreeQueryOptions } from '../hooks/use-popup-data';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFolderId?: string;
  onCreated?: (folder: BookmarkNode) => void;
};

export function AddFolderDialog({
  open,
  onOpenChange,
  currentFolderId,
  onCreated,
}: Props) {
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, '请输入名称'),
        parentId: z.string().min(1, '请选择位置'),
      }),
    [],
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '新建文件夹', parentId: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) return;
    (async () => {
      const t = await queryClient.ensureQueryData(popupTreeQueryOptions);
      setTree(t);
      const rootId = currentFolderId || t?.[0]?.id;
      // set defaults once dialog opens
      form.reset({ name: '新建文件夹', parentId: rootId || '' });
      // expand first layer by default
      const firstLayer = new Set<string>();
      for (const n of t?.[0]?.children || []) if (!n.url) firstLayer.add(n.id);
      setExpanded(firstLayer);
    })();
  }, [open, currentFolderId, form, queryClient]);

  // keep tree in dialog, no need to flatten

  const handleSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    try {
      const folder = await addFolder({
        title: values.name.trim(),
        parentId: values.parentId,
      });
      onCreated?.(folder);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  });

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="sm:max-w-lg overflow-hidden border border-white/30 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <DrawerHeader className="sticky top-0 z-20 flex flex-row items-center justify-between gap-3 border-b border-white/40 bg-white/90 px-5 py-3 text-left backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/80">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <DrawerTitle className="flex-1 text-center text-base font-semibold">
                新文件夹
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                为新目录命名并选择所属位置后保存。
              </DrawerDescription>
              <Button
                type="submit"
                size="sm"
                className="shadow-sm"
                disabled={!form.formState.isValid || saving}
              >
                保存
              </Button>
            </DrawerHeader>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-5 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称</FormLabel>
                    <FormControl>
                      <Input className="h-8 text-[13px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>位置</FormLabel>
                    <div className="max-h-72 overflow-hidden rounded-xl border border-dashed border-primary/20 bg-primary/5">
                      <div className="max-h-72 overflow-auto px-1 py-1">
                        <FolderTree
                          nodes={tree?.[0]?.children ?? []}
                          selected={field.value}
                          onSelect={(id) => field.onChange(id)}
                          expanded={expanded}
                          onToggle={(id) => {
                            const s = new Set(expanded);
                            if (s.has(id)) s.delete(id);
                            else s.add(id);
                            setExpanded(s);
                          }}
                        />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}

function FolderTree({
  nodes,
  depth = 0,
  selected,
  onSelect,
  expanded,
  onToggle,
}: {
  nodes: BookmarkNode[];
  depth?: number;
  selected?: string;
  onSelect: (id: string) => void;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="space-y-0.5 text-[13px]">
      {nodes.map((n) => (
        <li key={n.id}>
          <div
            className={
              'flex items-center gap-1 rounded-lg px-2 py-1 text-foreground transition-colors cursor-pointer select-none ' +
              (selected === n.id
                ? 'bg-primary/90 text-primary-foreground shadow-sm'
                : 'hover:bg-primary/10')
            }
            style={{ paddingLeft: depth * 16 + 8 }}
            onClick={() => onSelect(n.id)}
          >
            {hasSubfolder(n) ? (
              <button
                type="button"
                className={
                  'mr-1 rounded-md p-0.5 transition-colors ' +
                  (selected === n.id
                    ? 'hover:bg-primary/80'
                    : 'hover:bg-primary/20')
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(n.id);
                }}
              >
                {expanded.has(n.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <Folder className="h-4 w-4" />
            <OverflowTooltipCell
              text={n.title || '未命名'}
              className="flex-1 truncate text-left"
            />
          </div>
          {hasSubfolder(n) && expanded.has(n.id) && (
            <FolderTree
              nodes={(n.children || []).filter((c) => !c.url)}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
              expanded={expanded}
              onToggle={onToggle}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

function hasSubfolder(node: BookmarkNode) {
  return (node.children || []).some((c) => !c.url);
}

// no-op
