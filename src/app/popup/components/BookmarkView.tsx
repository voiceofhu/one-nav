'use client';

import { type BookmarkNode } from '@/extension/data';
import { type AccountCredential } from '@/extension/storage';
import { useMemo } from 'react';

import { AccountsSection } from './AccountsSection';
import { BookmarkActions } from './BookmarkActions';
import { BookmarkInfoSection } from './BookmarkInfoSection';
import { BookmarkViewHeader } from './BookmarkViewHeader';

interface BookmarkViewProps {
  node: BookmarkNode;
  accounts: AccountCredential[];
  onEdit: () => void;
  onDelete: () => void;
  onClose?: () => void;
}

export function BookmarkView({
  node,
  accounts,
  onEdit,
  onDelete,
  onClose,
}: BookmarkViewProps) {
  const updatedAt = node.dateGroupModified || node.dateAdded;
  const host = useMemo(() => getHost(node.url), [node.url]);
  const detailTitle = node.title?.trim() || host || '未命名书签';
  const safeUrl = node.url || '';

  return (
    <div className="mx-auto flex overflow-auto h-auto pb-6 w-full flex-col text-[12px] leading-snug text-foreground">
      <BookmarkViewHeader title={detailTitle} onEdit={onEdit} />
      <BookmarkInfoSection
        title={detailTitle}
        url={safeUrl}
        updatedAt={updatedAt}
      />
      <AccountsSection
        editing={false}
        accounts={accounts}
        draftAccounts={accounts}
        detailTitle={detailTitle}
        url={safeUrl}
        host={host}
        updatedAt={updatedAt}
      />

      <BookmarkActions onDelete={onDelete} onClose={onClose} />
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
