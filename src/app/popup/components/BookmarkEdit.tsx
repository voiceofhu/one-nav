'use client';

import { type BookmarkNode, updateBookmark } from '@/extension/data';
import { type AccountCredential, setBookmarkMeta } from '@/extension/storage';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { AccountEditList } from './AccountEditList';
import { BookmarkEditForm } from './BookmarkEditForm';
import { BookmarkEditHeader } from './BookmarkEditHeader';

interface BookmarkEditProps {
  node: BookmarkNode;
  accounts: AccountCredential[];
  onSave: () => void;
  onCancel: () => void;
  onClose?: () => void;
}

export function BookmarkEdit({
  node,
  accounts,
  onSave,
  onCancel,
  onClose,
}: BookmarkEditProps) {
  const [draftTitle, setDraftTitle] = useState(node.title || '');
  const [draftUrl, setDraftUrl] = useState(node.url || '');
  const [draftAccounts, setDraftAccounts] = useState<AccountCredential[]>(
    () => {
      return accounts.length > 0
        ? accounts.map((acc) => ({ ...acc }))
        : [{ username: '', password: '', totp: '' }];
    },
  );
  const [saving, setSaving] = useState(false);

  const detailTitle =
    node.title?.trim() || getHostFromUrl(node.url) || '未命名书签';

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

  const handleSave = useCallback(async () => {
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

      toast.success('已保存');
      onSave();
    } catch (err) {
      console.error(err);
      toast.error('保存失败，请稍后再试');
    } finally {
      setSaving(false);
    }
  }, [draftAccounts, draftTitle, draftUrl, node, onSave]);

  return (
    <div className="mx-auto flex overflow-auto h-auto pb-6 w-full flex-col text-[12px] leading-snug text-foreground">
      <BookmarkEditHeader
        title={detailTitle}
        saving={saving}
        onSave={handleSave}
        onCancel={onCancel}
        onClose={onClose}
      />

      <BookmarkEditForm
        title={draftTitle}
        url={draftUrl}
        onTitleChange={setDraftTitle}
        onUrlChange={setDraftUrl}
      />

      <AccountEditList
        accounts={draftAccounts}
        onAddAccount={addDraftAccount}
        onChangeAccount={updateDraftAccount}
        onRemoveAccount={removeDraftAccount}
      />
    </div>
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
