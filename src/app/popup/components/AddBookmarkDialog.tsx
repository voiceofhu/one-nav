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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { type BookmarkNode, addBookmark, getActiveTab } from '@/extension/data';
import { AccountCredential, setBookmarkMeta } from '@/extension/storage';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Folder } from 'lucide-react';
import { ChevronDown, ChevronRight, QrCode } from 'lucide-react';
import {
  type MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { popupTreeQueryOptions } from '../hooks/use-popup-data';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFolderId?: string;
  onCreated?: (b: BookmarkNode) => void;
};

type SectionKey = 'basic' | 'location' | 'accounts';

export function AddBookmarkDialog({
  open,
  onOpenChange,
  currentFolderId,
  onCreated,
}: Props) {
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<SectionKey>('basic');
  const contentRef = useRef<HTMLDivElement>(null);
  const basicSectionRef = useRef<HTMLDivElement>(null);
  const locationSectionRef = useRef<HTMLDivElement>(null);
  const accountsSectionRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(
    () =>
      [
        {
          value: 'basic' as SectionKey,
          label: '基础信息',
          ref: basicSectionRef,
        },
        {
          value: 'location' as SectionKey,
          label: '保存位置',
          ref: locationSectionRef,
        },
        {
          value: 'accounts' as SectionKey,
          label: '账号安全',
          ref: accountsSectionRef,
        },
      ] satisfies {
        value: SectionKey;
        label: string;
        ref: MutableRefObject<HTMLDivElement | null>;
      }[],
    [basicSectionRef, locationSectionRef, accountsSectionRef],
  );

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, '请输入名称'),
        url: z.string().url('请输入有效网址'),
        parentId: z.string().min(1, '请选择位置'),
        accounts: z
          .array(
            z.object({
              username: z.string().optional().default(''),
              password: z.string().optional().default(''),
              totp: z.string().optional().default(''),
            }),
          )
          .default([]),
      }),
    [],
  );

  const form = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      url: '',
      parentId: '',
      accounts: [{ username: '', password: '', totp: '' }],
    },
    mode: 'onChange',
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'accounts',
  });

  useEffect(() => {
    if (!open) return;
    (async () => {
      const t = await queryClient.ensureQueryData(popupTreeQueryOptions);
      setTree(t);
      const tab = await getActiveTab();
      const rootId = currentFolderId || t?.[0]?.id;
      form.reset({
        title: tab?.title || '',
        url: tab?.url || '',
        parentId: rootId || '',
        accounts: [{ username: '', password: '', totp: '' }],
      });
      const firstLayer = new Set<string>();
      for (const n of t?.[0]?.children || []) if (!n.url) firstLayer.add(n.id);
      setExpanded(firstLayer);
      setActiveSection('basic');
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0 });
      }
    })();
  }, [open, currentFolderId, form, queryClient]);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      let current: SectionKey = 'basic';
      for (const section of sections) {
        const node = section.ref.current;
        if (!node) continue;
        const offset = node.getBoundingClientRect().top - containerTop;
        if (offset <= 56) {
          current = section.value;
        }
      }
      setActiveSection((prev) => (prev === current ? prev : current));
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [sections]);

  const handleSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    try {
      const node = await addBookmark({
        title: values.title.trim(),
        url: values.url.trim(),
        parentId: values.parentId,
      });
      const accs = values.accounts || [];
      const anyFilled = accs.some(
        (a) => (a.username || a.password || a.totp)?.trim?.() || false,
      );
      if (anyFilled) {
        const normalized: AccountCredential[] = accs.map((a) => ({
          username: a.username || '',
          password: a.password || '',
          totp: a.totp || '',
        }));
        await setBookmarkMeta(node.id, { accounts: normalized });
      }
      // 刷新查询缓存
      await queryClient.invalidateQueries(popupTreeQueryOptions);
      toast.success('已成功添加书签');
      onCreated?.(node);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      toast.error('添加书签失败，请稍后再试');
    } finally {
      setSaving(false);
    }
  });

  function addAccount() {
    append({ username: '', password: '', totp: '' });
  }

  function updateAccount(i: number, patch: Partial<AccountCredential>) {
    const current = fields[i];
    update(i, { ...current, ...patch });
  }

  function removeAccount(i: number) {
    remove(i);
  }

  async function importTotpFromImage(i: number, file: File) {
    try {
      const data = await decodeQRFromImage(file);
      if (data) updateAccount(i, { totp: data });
      else toast.error('未识别到二维码');
    } catch (e) {
      console.error(e);
      toast.error('识别二维码失败');
    }
  }

  function handleSectionChange(value: string) {
    const section = sections.find((item) => item.value === value);
    if (!section) return;
    setActiveSection(section.value);
    const container = contentRef.current;
    const target = section.ref.current;
    if (!container || !target) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const nextTop =
      targetRect.top - containerRect.top + container.scrollTop - 12;
    container.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="sm:max-w-[600px] overflow-hidden border border-white/30 bg-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 ">
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex h-full overflow-auto flex-col"
          >
            <DrawerHeader className="sticky top-0 z-20 flex flex-row items-center justify-between gap-3 border-b border-white/40 bg-white/90 px-5 py-3 text-left backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/80">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="font-medium text-muted-foreground hover:text-foreground"
                onClick={() => onOpenChange(false)}
              >
                <ArrowLeft />
              </Button>
              <DrawerTitle className="flex-1 text-center text-base font-semibold">
                添加书签
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                填写书签名称、链接和其它信息后保存。
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
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto px-5 pb-6 pt-4"
            >
              <Tabs
                value={activeSection}
                onValueChange={handleSectionChange}
                className="sticky top-0 z-20 bg-white/95 pb-2 backdrop-blur-md dark:bg-slate-950/85"
              >
                <TabsList className="w-full justify-start gap-2 bg-muted/60 px-2 py-1">
                  {sections.map((section) => (
                    <TabsTrigger
                      key={section.value}
                      value={section.value}
                      className="flex-1 whitespace-nowrap px-3 py-1 text-[12px]"
                    >
                      {section.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="mt-4 flex flex-col gap-8 pb-2">
                <section
                  ref={basicSectionRef}
                  id="add-bookmark-basic"
                  className="space-y-4"
                >
                  <div className="text-[12px] font-semibold text-muted-foreground">
                    基础信息
                  </div>
                  <div className="grid grid-cols-1 gap-4 ">
                    <FormField
                      control={form.control}
                      name="title"
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
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>网址</FormLabel>
                          <FormControl>
                            <Textarea
                              className="h-auto min-h-8 text-[13px]"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section
                  ref={locationSectionRef}
                  id="add-bookmark-location"
                  className="space-y-3"
                >
                  <div className="text-[12px] font-semibold text-muted-foreground">
                    保存位置
                  </div>
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
                </section>

                <Separator />

                <section
                  ref={accountsSectionRef}
                  id="add-bookmark-accounts"
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">账号与安全</div>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      className="border-dashed"
                      onClick={addAccount}
                    >
                      + 添加账号
                    </Button>
                  </div>
                  {(fields.length === 0 && (
                    <div className="text-xs text-muted-foreground">
                      可选：为该网站添加一个或多个账号密码，并可附加 TOTP
                    </div>
                  )) || (
                    <div className="space-y-3">
                      {fields.map((acc, i) => (
                        <div
                          key={acc.id}
                          className="space-y-3 rounded-xl border border-border/60 bg-white/70 p-3 shadow-sm dark:bg-slate-950/40"
                        >
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <Input
                              placeholder="账号密码"
                              className="h-8 text-[13px]"
                              value={
                                form.getValues(`accounts.${i}.username`) || ''
                              }
                              onChange={(e) =>
                                updateAccount(i, { username: e.target.value })
                              }
                            />
                            <Input
                              placeholder="密码"
                              type="password"
                              className="h-8 text-[13px]"
                              value={
                                form.getValues(`accounts.${i}.password`) || ''
                              }
                              onChange={(e) =>
                                updateAccount(i, { password: e.target.value })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-12">
                            <Input
                              className="h-8 text-[13px] md:col-span-8"
                              placeholder="otpauth:// 或密钥"
                              value={form.getValues(`accounts.${i}.totp`) || ''}
                              onChange={(e) =>
                                updateAccount(i, { totp: e.target.value })
                              }
                            />
                            <div className="flex items-center gap-2 md:col-span-4">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) importTotpFromImage(i, f);
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <QrCode className="mr-1 h-4 w-4" /> 识别二维码
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => removeAccount(i)}
                              >
                                删除
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
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

// Try to decode QR code to string using BarcodeDetector
type BarcodeDetection = { rawValue?: string };
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => {
  detect: (
    source: ImageBitmapSource | ImageBitmap,
  ) => Promise<BarcodeDetection[]>;
};

async function decodeQRFromImage(file: File): Promise<string | null> {
  const BD: BarcodeDetectorCtor | undefined =
    typeof window !== 'undefined'
      ? (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
          .BarcodeDetector
      : undefined;
  if (!BD) return null;
  try {
    const detector = new BD({ formats: ['qr_code'] });
    const bitmap = await createImageBitmap(file);
    const result = await detector.detect(bitmap);
    const raw = result?.[0]?.rawValue;
    return raw ?? null;
  } catch (e) {
    console.warn('BarcodeDetector not available or failed', e);
    return null;
  }
}
