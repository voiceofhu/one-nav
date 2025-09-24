'use client';

import { OverflowTooltipCell } from '@/components/overflow-tooltip';
import { Button } from '@/components/ui/button';
import { openUrlInNewTab, runBookmarklet } from '@/extension/chrome';
import { type BookmarkNode } from '@/extension/data';
import { type AccountCredential, getBookmarkMeta } from '@/extension/storage';
import { useCopy } from '@/hooks/use-copy';
import { formatToNow } from '@/lib/utils';
import {
  type DragEndEvent,
  type DragStartEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  useDndMonitor,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, Play } from 'lucide-react';
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

import { usePopupState } from '../state/popup-state';
import { BookmarkAvatar } from './BookmarkAvatar';
import {
  requiresChromeTabsNavigation,
  stripJavascriptPrefix,
  toLinkErrorMessage,
  toScriptErrorMessage,
} from './BookmarkUrlAction';
import { TotpRing, useTotp } from './TotpDisplay';

type Props = {
  items: BookmarkNode[];
  showLoading: boolean;
  isExt: boolean;
  // When set, enables drag-sort within this parent folder
  sortableParentId?: string;
  onBookmarkMove: (
    id: string,
    destination: { parentId?: string; index?: number },
  ) => Promise<void>;
};

export function BookmarksList({
  items,
  showLoading,
  isExt,
  sortableParentId,
  onBookmarkMove,
}: Props) {
  if (!isExt) {
    return (
      <div>
        <div className="mb-2 text-sm text-orange-600">
          非扩展环境预览：Chrome API 不可用
        </div>
        <BookmarksListContent
          items={items}
          showLoading={showLoading}
          sortableParentId={sortableParentId}
          onBookmarkMove={onBookmarkMove}
        />
      </div>
    );
  }

  return (
    <BookmarksListContent
      items={items}
      showLoading={showLoading}
      sortableParentId={sortableParentId}
      onBookmarkMove={onBookmarkMove}
    />
  );
}

function BookmarksListContent({
  items,
  showLoading,
  sortableParentId,
  onBookmarkMove,
}: {
  items: BookmarkNode[];
  showLoading: boolean;
  sortableParentId?: string;
  onBookmarkMove: (
    id: string,
    destination: { parentId?: string; index?: number },
  ) => Promise<void>;
}) {
  if (showLoading) {
    return <div className="p-4 text-sm text-muted-foreground">加载中...</div>;
  }

  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">暂无书签</div>;
  }
  return (
    <SortableBookmarksList
      items={items}
      sortableParentId={sortableParentId}
      onBookmarkMove={onBookmarkMove}
    />
  );
}

type SortableBookmarksListProps = {
  items: BookmarkNode[];
  sortableParentId?: string;
  onBookmarkMove: (
    id: string,
    destination: { parentId?: string; index?: number },
  ) => Promise<void>;
};

function SortableBookmarksList({
  items,
  sortableParentId,
  onBookmarkMove,
}: SortableBookmarksListProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
    setOrderedItems(items);
  }, [items]);

  const itemIds = useMemo(
    () => orderedItems.map((item) => item.id),
    [orderedItems],
  );
  const allowSorting = Boolean(sortableParentId);
  useDndMonitor({
    onDragStart(event: DragStartEvent) {
      const data = event.active.data.current as
        | { type: 'bookmark'; node: BookmarkNode }
        | undefined;
      if (data?.type !== 'bookmark') return;
    },
    onDragCancel(event) {
      const data = event.active.data.current as
        | { type: 'bookmark' }
        | undefined;
      if (data?.type !== 'bookmark') return;
      setOrderedItems(items);
    },
    onDragEnd(event: DragEndEvent) {
      const data = event.active.data.current as
        | {
            type: 'bookmark';
            node: BookmarkNode;
          }
        | undefined;
      if (data?.type !== 'bookmark') return;

      const overData = event.over?.data.current as
        | { type: 'bookmark'; node: BookmarkNode }
        | { type: 'category'; folderId: string }
        | undefined;

      if (!event.over) {
        setOrderedItems(itemsRef.current);
        return;
      }

      if (overData?.type === 'bookmark') {
        if (!sortableParentId) {
          setOrderedItems(itemsRef.current);
          return;
        }
        const activeIndex = orderedItems.findIndex(
          (item) => item.id === event.active.id,
        );
        const overIndex = orderedItems.findIndex(
          (item) => item.id === event.over?.id,
        );

        if (
          activeIndex === -1 ||
          overIndex === -1 ||
          activeIndex === overIndex
        ) {
          setOrderedItems(itemsRef.current);
          return;
        }

        const nextItems = arrayMove(orderedItems, activeIndex, overIndex);
        setOrderedItems(nextItems);

        void (async () => {
          try {
            await onBookmarkMove(String(event.active.id), {
              parentId: sortableParentId,
              index: overIndex,
            });
          } catch (error) {
            console.error('Failed to reorder bookmark', error);
            setOrderedItems(itemsRef.current);
            toast.error('排序失败，请稍后重试');
          }
        })();
        return;
      }

      if (overData?.type === 'category') {
        const destinationParent = overData.folderId;
        const currentParent = data.node.parentId;
        if (destinationParent === currentParent) {
          setOrderedItems(itemsRef.current);
          return;
        }

        setOrderedItems((prev) =>
          prev.filter((item) => item.id !== event.active.id),
        );

        void (async () => {
          try {
            await onBookmarkMove(String(event.active.id), {
              parentId: destinationParent,
            });
          } catch (error) {
            console.error('Failed to move bookmark to folder', error);
            setOrderedItems(itemsRef.current);
            toast.error('移动失败，请稍后重试');
          }
        })();
        return;
      }

      setOrderedItems(itemsRef.current);
    },
  });

  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
      <ul className="mt-1.5 space-y-1.5 px-1">
        {orderedItems.map((node) => (
          <SortableBookmarkListItem
            key={node.id}
            node={node}
            isSortable={allowSorting}
          />
        ))}
      </ul>
    </SortableContext>
  );
}

function SortableBookmarkListItem({
  node,
  isSortable,
}: {
  node: BookmarkNode;
  isSortable: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: {
      type: 'bookmark' as const,
      node,
    },
    disabled: false,
  });

  const style: CSSProperties | undefined = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : { transition };

  return (
    <li>
      <BookmarkCard
        node={node}
        isSortable={isSortable}
        dragAttributes={attributes}
        dragListeners={listeners}
        dragStyle={style}
        setNodeRef={setNodeRef}
        isDragging={isDragging}
      />
    </li>
  );
}

type BookmarkCardProps = {
  node: BookmarkNode;
  isSortable?: boolean;
  dragAttributes?: DraggableAttributes;
  dragListeners?: DraggableSyntheticListeners;
  dragStyle?: CSSProperties;
  setNodeRef?: (element: HTMLDivElement | null) => void;
  isDragging?: boolean;
  disableInteractions?: boolean;
  loadMeta?: boolean;
};

function BookmarkCard({
  node,
  isSortable = false,
  dragAttributes,
  dragListeners,
  dragStyle,
  setNodeRef,
  isDragging = false,
  disableInteractions = false,
  loadMeta = true,
}: BookmarkCardProps) {
  const popup = usePopupState();
  const url = node.url || '';
  const isScript = url.trim().toLowerCase().startsWith('javascript:');
  const title = node.title || url;
  const [accounts, setAccounts] = useState<AccountCredential[]>([]);

  useEffect(() => {
    if (!loadMeta) return;
    let active = true;
    (async () => {
      try {
        const meta = await getBookmarkMeta(node.id);
        if (!active) return;
        setAccounts(meta?.accounts || []);
      } catch (error) {
        console.error('Failed to load bookmark meta:', error);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadMeta, node.id]);

  const primaryAccount = accounts[0];
  const totpAccounts = useMemo(
    () => accounts.filter((acc) => acc.totp?.trim()),
    [accounts],
  );

  const timeText = useMemo(() => {
    const d = node.dateAdded;
    if (!d) return null;
    try {
      return formatToNow(new Date(d));
    } catch {
      return null;
    }
  }, [node.dateAdded]);

  const isActive = popup.detailId === node.id;

  const clickable = !disableInteractions;

  const pointerClass = disableInteractions
    ? ' cursor-default'
    : isSortable
      ? ' cursor-grab active:cursor-grabbing'
      : clickable
        ? ' cursor-pointer'
        : ' cursor-default';

  const baseRowClass =
    'group rounded-xl border px-3 py-2.5 text-[13px] transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
    (isActive
      ? 'border-primary/70 bg-primary/10 shadow-sm'
      : 'border-border/60 bg-card/70') +
    pointerClass +
    (isDragging ? ' opacity-95 ring-2 ring-primary/50 shadow-lg' : '');

  const style: CSSProperties = {
    ...(dragStyle ?? {}),
    pointerEvents: disableInteractions ? 'none' : undefined,
  };

  const handleRowClick = (event?: React.SyntheticEvent) => {
    if (!clickable) return;
    event?.preventDefault();
    event?.stopPropagation();
    popup.openDetail(node.id);
  };

  const handleOpenAction = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const trimmed = url.trim();
    if (!trimmed) return;

    if (isScript) {
      const code = stripJavascriptPrefix(trimmed);
      if (!code) return;
      try {
        await runBookmarklet(code);
      } catch (error) {
        console.error('Failed to execute bookmarklet', error);
        toast.error(toScriptErrorMessage(error));
      }
      return;
    }

    try {
      if (requiresChromeTabsNavigation(trimmed)) {
        await openUrlInNewTab(trimmed);
      } else if (typeof window !== 'undefined') {
        window.open(trimmed, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to open bookmark link', error);
      toast.error(toLinkErrorMessage(error));
    }
  };

  const interactiveAccessibilityProps =
    clickable && !isSortable
      ? ({
          role: 'button' as const,
          tabIndex: 0,
        } satisfies Partial<DraggableAttributes>)
      : undefined;

  const effectiveDragAttributes =
    isSortable && !disableInteractions ? dragAttributes : undefined;
  const effectiveDragListeners =
    !disableInteractions && isSortable ? dragListeners : undefined;

  return (
    <div
      ref={setNodeRef}
      className={baseRowClass}
      style={style}
      {...(effectiveDragAttributes ?? {})}
      {...(interactiveAccessibilityProps ?? {})}
      onClick={clickable ? handleRowClick : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                handleRowClick(event);
              }
            }
          : undefined
      }
      {...(effectiveDragListeners ?? {})}
    >
      <div className="flex gap-2">
        <div className="flex shrink-0 items-center justify-center overflow-hidden">
          <BookmarkAvatar url={url} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-3">
            <OverflowTooltipCell
              text={title}
              tooltipText={title}
              className="w-full truncate text-[13px] font-semibold text-foreground"
            />
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg bg-muted/30 hover:bg-primary/10"
                onClick={handleOpenAction}
                aria-label={isScript ? '执行脚本' : '打开链接'}
              >
                {isScript ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <OverflowTooltipCell
                text={url}
                tooltipText={url}
                className="min-w-0 truncate"
              />
              {timeText && (
                <span className="shrink-0 text-muted-foreground/75">
                  {timeText}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {primaryAccount && (
        <div className="mt-1 flex items-center justify-between gap-2 rounded-md bg-muted/70 px-2 py-1 text-[11px]">
          <div className="flex min-w-0 items-center gap-1 text-muted-foreground">
            <span className="truncate font-mono text-xs">
              {primaryAccount.username || '未设置'}
            </span>
            {primaryAccount.label && (
              <span className="rounded-sm bg-muted-foreground/10 px-1 py-px text-[10px] text-muted-foreground">
                {primaryAccount.label}
              </span>
            )}
          </div>
          {primaryAccount.password && (
            <span className="font-mono text-[10px] text-muted-foreground">
              密码已保存
            </span>
          )}
        </div>
      )}
      {totpAccounts.length > 0 && <TotpBadgeSection accounts={totpAccounts} />}
    </div>
  );
}

function TotpBadgeSection({ accounts }: { accounts: AccountCredential[] }) {
  const primary = accounts[0];
  const { progress, period } = useTotp(primary?.totp);
  const remaining = primary?.totp ? formatRemaining(period, progress) : null;

  return (
    <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 px-2 py-2 text-[11px]">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.25em] text-primary/70">
        <span>动态验证码</span>
        {primary?.totp && remaining !== null && (
          <div className="flex items-center gap-1 text-primary/70">
            <TotpRing progress={progress} compact />
            <span className="font-mono tracking-widest">{remaining}</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {accounts.map((account, index) => (
          <TotpBadge
            key={`${account.username || index}-${index}`}
            account={account}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function TotpBadge({
  account,
  index,
}: {
  account: AccountCredential;
  index: number;
}) {
  const label =
    account.label?.trim() || account.username?.trim() || `账号 ${index + 1}`;
  const { code, progress, period } = useTotp(account.totp);
  const { copy } = useCopy();
  const formattedCode = formatTotpCode(code);
  const remaining = formatRemaining(period, progress);

  function handleCopy() {
    if (!account.totp?.trim()) {
      toast.error('未配置验证码');
      return;
    }
    if (!code || code === '000000') {
      toast.error('验证码未就绪');
      return;
    }
    copy(code);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex min-w-[140px] items-center gap-2 rounded-lg border border-primary/20 bg-white/90 px-2 py-2 text-left shadow-sm transition hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-emerald-900/40 dark:bg-slate-900/80 dark:hover:border-emerald-500/60 dark:hover:bg-slate-900/60"
    >
      <TotpRing progress={progress} />
      <div className="flex flex-col leading-tight">
        <span className="font-mono text-[13px] tracking-[0.35em] text-primary group-hover:text-primary-600 dark:text-emerald-300 dark:group-hover:text-emerald-200">
          {formattedCode}
        </span>
        <span className="text-[10px] text-muted-foreground group-hover:text-primary/80 dark:group-hover:text-emerald-200">
          {label}
        </span>
      </div>
      {remaining !== null && (
        <span className="ml-auto text-[10px] font-medium text-muted-foreground group-hover:text-primary/80 dark:group-hover:text-emerald-200">
          {remaining}
        </span>
      )}
    </button>
  );
}

function formatTotpCode(code: string) {
  const normalized = code?.trim();
  if (!normalized || normalized.length < 6) return '—— ——';
  return `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
}

function formatRemaining(period: number, progress: number) {
  if (!Number.isFinite(period) || period <= 0) return null;
  const clampedProgress = Math.max(0, Math.min(progress, 0.999));
  const remain = Math.max(0, Math.ceil((1 - clampedProgress) * period));
  return `${remain.toString().padStart(2, '0')}s`;
}
