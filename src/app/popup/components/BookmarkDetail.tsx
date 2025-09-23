'use client';

import { type BookmarkNode, getNode, removeBookmark } from '@/extension/data';
import { type AccountCredential, getBookmarkMeta } from '@/extension/storage';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { popupTreeQueryOptions } from '../hooks/use-popup-data';
import { usePopupState } from '../state/popup-state';
import { BookmarkEdit } from './BookmarkEdit';
import { BookmarkView } from './BookmarkView';
import { ConfirmDialog } from './ConfirmDialog';

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

  const startEditing = useCallback(() => {
    setEditing(true);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    await refresh();
    onMutate?.();
    setEditing(false);
  }, [refresh, onMutate]);

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

  const detailTitle =
    node.title?.trim() || getHostFromUrl(node.url) || '未命名书签';

  return (
    <>
      {editing ? (
        <BookmarkEdit
          node={node}
          accounts={accounts}
          onSave={handleSave}
          onCancel={cancelEditing}
          onClose={onClose}
        />
      ) : (
        <BookmarkView
          node={node}
          accounts={accounts}
          onEdit={startEditing}
          onDelete={handleDelete}
          onClose={onClose}
        />
      )}

      <ConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="确认删除书签吗？"
        description={
          <span>
            将永久删除&ldquo;<strong>{detailTitle}</strong>
            &rdquo;。此操作不可撤销。
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
    </>
  );
}

function getHostFromUrl(url?: string | null) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
