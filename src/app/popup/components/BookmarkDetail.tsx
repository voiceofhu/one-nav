'use client';

import {
  type BookmarkNode,
  getNode,
  removeBookmark,
  updateBookmark,
} from '@/extension/data';
import {
  type AccountCredential,
  getBookmarkMeta,
  setBookmarkMeta,
} from '@/extension/storage';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { popupTreeQueryOptions } from '../hooks/use-popup-data';
import { usePopupState } from '../state/popup-state';
import { AccountsSection } from './AccountsSection';
import {
  BookmarkDetailHeader,
  BookmarkOverviewSection,
} from './BookmarkHeader';
import { ConfirmDialog } from './ConfirmDialog';
import { SecurityCard } from './SecurityCard';

export function BookmarkDetail({
  id,
  onMutate,
  onClose,
}: {
  id: string;
  onMutate?: () => void;
  onClose?: () => void;
}) {
  const [node, setNode] = useState<BookmarkNode | null>(null);
  const [accounts, setAccounts] = useState<AccountCredential[]>([]);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftUrl, setDraftUrl] = useState('');
  const [draftAccounts, setDraftAccounts] = useState<AccountCredential[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const { closeDetail } = usePopupState();
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    const [n, meta] = await Promise.all([getNode(id), getBookmarkMeta(id)]);
    setNode(n || null);
    setAccounts(meta?.accounts || []);
  }, [id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [n, meta] = await Promise.all([getNode(id), getBookmarkMeta(id)]);
        if (!active) return;
        setNode(n || null);
        setAccounts(meta?.accounts || []);
        setEditing(false);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const primaryAccount = accounts[0];
  const updatedAt = node?.dateGroupModified || node?.dateAdded;
  const host = useMemo(() => getHost(node?.url), [node?.url]);

  const startEditing = useCallback(() => {
    if (!node) return;
    setDraftTitle(node.title || '');
    setDraftUrl(node.url || '');
    const next =
      accounts.length > 0
        ? accounts.map((acc) => ({ ...acc }))
        : [{ username: '', password: '', totp: '' }];
    setDraftAccounts(next);
    setEditing(true);
  }, [accounts, node]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    setDraftTitle('');
    setDraftUrl('');
    setDraftAccounts([]);
  }, []);

  const updateDraftAccount = useCallback(
    (index: number, patch: Partial<AccountCredential>) => {
      setDraftAccounts((prev) =>
        prev.map((acc, i) => (i === index ? { ...acc, ...patch } : acc)),
      );
    },
    [],
  );

  const removeDraftAccount = useCallback((index: number) => {
    setDraftAccounts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addDraftAccount = useCallback(() => {
    setDraftAccounts((prev) => [
      ...prev,
      { username: '', password: '', totp: '' },
    ]);
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (!node) return;
    setSaving(true);
    try {
      const trimmedTitle = draftTitle.trim();
      const safeTitle = trimmedTitle || node.url || '书签';
      const trimmedUrl = draftUrl.trim();
      await updateBookmark(node.id, {
        title: safeTitle,
        url: trimmedUrl || node.url || '',
      });

      const cleaned = draftAccounts
        .map((acc) => ({
          username: acc.username?.trim() || '',
          password: acc.password || '',
          totp: acc.totp?.trim() || '',
          label: acc.label?.trim() || undefined,
        }))
        .filter((acc) => acc.username || acc.password || acc.totp || acc.label);

      await setBookmarkMeta(node.id, { accounts: cleaned });
      await refresh();
      onMutate?.();
      toast.success('已保存');
      cancelEditing();
    } catch (err) {
      console.error(err);
      toast.error('保存失败，请稍后再试');
    } finally {
      setSaving(false);
    }
  }, [
    cancelEditing,
    draftAccounts,
    draftTitle,
    draftUrl,
    node,
    onMutate,
    refresh,
  ]);

  const handleDelete = useCallback(() => {
    if (!node) return;
    setOpenConfirm(true);
  }, [node]);

  if (!node) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {loading ? '加载中...' : '未找到书签'}
      </div>
    );
  }

  const detailTitle = node.title?.trim() || host || '未命名书签';

  return (
    <div className="mx-auto flex h-full w-full min-w-0 max-w-none flex-col gap-2 pb-6 text-[12px] leading-snug text-foreground">
      <BookmarkDetailHeader
        editing={editing}
        title={detailTitle}
        saving={saving}
        draftTitle={draftTitle}
        onEdit={startEditing}
        onCancel={cancelEditing}
        onDelete={handleDelete}
        onSave={handleSaveAll}
        onClose={onClose}
      />
      <BookmarkOverviewSection
        editing={editing}
        detailTitle={detailTitle}
        draftTitle={draftTitle}
        draftUrl={draftUrl}
        url={node.url || ''}
        host={host}
        updatedAt={updatedAt}
        onTitleChange={setDraftTitle}
        onUrlChange={setDraftUrl}
      />

      <AccountsSection
        editing={editing}
        accounts={accounts}
        draftAccounts={draftAccounts}
        detailTitle={detailTitle}
        url={node.url || ''}
        host={host}
        updatedAt={updatedAt}
        onAddAccount={addDraftAccount}
        onChangeAccount={updateDraftAccount}
        onRemoveAccount={removeDraftAccount}
      />

      {!editing && primaryAccount ? (
        <SecurityCard account={primaryAccount} />
      ) : null}

      <ConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="确认删除书签"
        description={
          <span>
            将永久删除“<strong>{detailTitle}</strong>”。此操作不可撤销。
          </span>
        }
        confirmText="删除"
        onConfirm={async () => {
          await removeBookmark(node.id);
          // 刷新查询缓存
          await queryClient.invalidateQueries(popupTreeQueryOptions);
          toast.success('已删除书签');
          onMutate?.();
          closeDetail();
        }}
      />
    </div>
  );
}

function getHost(url?: string | null) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
