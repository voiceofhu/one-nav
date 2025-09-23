'use client';

import { OverflowTooltipCell } from '@/components/overflow-tooltip';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  type BookmarkNode,
  getChildren,
  moveNode,
  removeBookmark,
} from '@/extension/data';
import { type AccountCredential, getBookmarkMeta } from '@/extension/storage';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Code2, MoreHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { usePopupState } from '../state/popup-state';
import { TotpDisplay } from './TotpDisplay';

type Props = {
  items: BookmarkNode[];
  showLoading: boolean;
  isExt: boolean;
  onMutate?: () => void;
  // When set, enables drag-sort within this parent folder
  sortableParentId?: string;
};

export function BookmarksList({
  items,
  showLoading,
  isExt,
  onMutate,
  sortableParentId,
}: Props) {
  if (!isExt) {
    return (
      <div>
        <div className="text-sm text-orange-600 mb-2">
          非扩展环境预览：Chrome API 不可用
        </div>
        {renderList(items, showLoading, onMutate, sortableParentId)}
      </div>
    );
  }
  return renderList(items, showLoading, onMutate, sortableParentId);
}

function renderList(
  items: BookmarkNode[],
  showLoading: boolean,
  onMutate?: () => void,
  sortableParentId?: string,
) {
  if (showLoading) {
    return <div className="text-sm p-4 text-muted-foreground">加载中...</div>;
  }
  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">暂无书签</div>;
  }
  return (
    <ul
      className="mt-1.5 space-y-1.5 px-1"
      onDragOver={(e) => {
        // allow drop at end of list
        if (sortableParentId) e.preventDefault();
      }}
      onDrop={async (e) => {
        const dragId = e.dataTransfer.getData('text/plain');
        if (!sortableParentId || !dragId) return;
        try {
          const children = await getChildren(sortableParentId);
          const without = children.filter((c) => c.id !== dragId);
          // place at end
          await moveNode(dragId, {
            parentId: sortableParentId,
            index: without.length,
          });
          onMutate?.();
        } catch (err) {
          console.error(err);
        }
      }}
    >
      {items.map((b) => (
        <BookmarkRow
          key={b.id}
          node={b}
          onMutate={onMutate}
          sortableParentId={sortableParentId}
        />
      ))}
    </ul>
  );
}

function BookmarkRow({
  node,
  onMutate,
  sortableParentId,
}: {
  node: BookmarkNode;
  onMutate?: () => void;
  sortableParentId?: string;
}) {
  const url = node.url || '';
  const isScript = url.trim().toLowerCase().startsWith('javascript:');
  const title = node.title || url;
  const popup = usePopupState();
  const isActive = popup.detailId === node.id;
  const [accounts, setAccounts] = useState<AccountCredential[]>([]);

  useEffect(() => {
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
  }, [node.id]);

  const primaryAccount = accounts[0];
  const hasTotp = primaryAccount?.totp?.trim();

  const timeText = useMemo(() => {
    const d = node.dateAdded;
    if (!d) return null;
    try {
      return formatDistanceToNow(new Date(d), {
        addSuffix: true,
        locale: zhCN,
      });
    } catch {
      return null;
    }
  }, [node.dateAdded]);

  function gotoDetail() {
    popup.openDetail(node.id);
  }

  async function handleDelete() {
    setConfirmOpen(true);
  }

  const [confirmOpen, setConfirmOpen] = useState(false);

  const RowInner = (
    <div
      className={
        'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] shadow-sm transition hover:border-border hover:bg-card hover:shadow-md ' +
        (isActive
          ? 'border-primary/70 bg-primary/10'
          : 'border-border/60 bg-card/70') +
        (sortableParentId ? ' cursor-grab active:cursor-grabbing' : '')
      }
      draggable={Boolean(sortableParentId)}
      onDragStart={(e) => {
        if (!sortableParentId) return;
        e.dataTransfer.setData('text/plain', node.id);
        // Avoid opening the link while dragging
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        if (!sortableParentId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={async (e) => {
        if (!sortableParentId) return;
        e.preventDefault();
        const dragId = e.dataTransfer.getData('text/plain');
        if (!dragId || dragId === node.id) return;
        try {
          const rect = (
            e.currentTarget as HTMLDivElement
          ).getBoundingClientRect();
          const before = e.clientY < rect.top + rect.height / 2;
          const children = await getChildren(sortableParentId);
          const without = children.filter((c) => c.id !== dragId);
          const targetIdx = without.findIndex((c) => c.id === node.id);
          const destIndex = Math.max(0, before ? targetIdx : targetIdx + 1);
          await moveNode(dragId, {
            parentId: sortableParentId,
            index: destIndex,
          });
          onMutate?.();
        } catch (err) {
          console.error(err);
        }
      }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background/40 shadow-inner dark:bg-slate-900/60">
        <BookmarkIcon url={url} isScript={isScript} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3 mb-1">
          <OverflowTooltipCell
            text={title}
            tooltipText={title}
            className="w-full truncate text-[13px] font-semibold text-foreground"
          />
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant={isActive ? 'default' : 'secondary'}
              size="sm"
              className="h-7 rounded-lg px-3 text-[11px]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                gotoDetail();
              }}
            >
              {'详情'}
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
          {primaryAccount && (
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>账号密码:</span>
                <span className="font-mono text-xs">
                  {primaryAccount.username || '未设置'}
                </span>
              </div>
              {hasTotp && (
                <div className="shrink-0">
                  <TotpDisplay totp={primaryAccount.totp} compact={true} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const clickable = !sortableParentId && !isScript;
  return (
    <li>
      {clickable ? (
        <a href={url} target="_blank" rel="noreferrer" className="block">
          {RowInner}
        </a>
      ) : (
        RowInner
      )}
      {/* <ConfirmDrawer
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="确认删除书签"
        description={
          <span>
            将长期删除“<strong>{title}</strong>”。此操作不可撤销。
          </span>
        }
        onConfirm={async () => {
          await removeBookmark(node.id);
          onMutate?.();
        }}
      /> */}
    </li>
  );
}

function BookmarkIcon({ url, isScript }: { url: string; isScript: boolean }) {
  const iconCandidates = useMemo(
    () => (isScript ? [] : getFaviconCandidates(url)),
    [isScript, url],
  );
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [isScript, url]);

  if (isScript) {
    return <Code2 className="size-5 text-purple-600" aria-hidden />;
  }

  const handleError = () => {
    setCandidateIndex((prev) =>
      prev < iconCandidates.length ? prev + 1 : prev,
    );
  };

  const resolvedSrc =
    iconCandidates[candidateIndex] ??
    (iconCandidates.length === 0 ? getFaviconUrl(url) : undefined);

  return (
    <img
      className="size-6 object-cover"
      src={resolvedSrc ?? '/globe.svg'}
      alt="favicon"
      onError={handleError}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

function getFaviconCandidates(url: string): string[] {
  try {
    const u = new URL(url);
    const domainUrl = `${u.protocol}//${u.hostname}`;

    const candidates = [
      // FaviconKit prefers high-res PWA/touch icons and works reliably in mainland China.
      // `https://api.faviconkit.com/${encodedHost}/192`,
      // `https://api.faviconkit.com/${encodedHost}/64`,
      `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(domainUrl)}`,
      // `https://icons.duckduckgo.com/ip3/${host}.ico`,
    ];

    const seen = new Set<string>();
    return candidates.filter((icon) => {
      if (!icon || seen.has(icon)) return false;
      seen.add(icon);
      return true;
    });
  } catch {
    return [];
  }
}

function getFaviconUrl(url: string) {
  const [primary] = getFaviconCandidates(url);
  return primary ?? '/globe.svg';
}
