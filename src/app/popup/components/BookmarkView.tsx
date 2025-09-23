'use client';

import { type BookmarkNode } from '@/extension/data';
import { type AccountCredential } from '@/extension/storage';
import { useMemo } from 'react';

import { AccountDisplayList } from './AccountDisplayList';
import { BookmarkInfoSection } from './BookmarkInfoSection';
import { BookmarkViewHeader } from './BookmarkViewHeader';
import { SecurityCard } from './SecurityCard';

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
  const primaryAccount = accounts[0];
  const updatedAt = node.dateGroupModified || node.dateAdded;
  const host = useMemo(() => getHost(node.url), [node.url]);
  const detailTitle = node.title?.trim() || host || '未命名书签';

  return (
    <div className="mx-auto flex overflow-auto h-auto pb-6 w-full flex-col text-[12px] leading-snug text-foreground overflow-hidden">
      <BookmarkViewHeader
        title={detailTitle}
        onEdit={onEdit}
        onDelete={onDelete}
        onClose={onClose}
      />
      <BookmarkInfoSection
        title={detailTitle}
        url={node.url || ''}
        host={host}
        updatedAt={updatedAt}
      />
      <AccountDisplayList accounts={accounts} />
      {primaryAccount && <SecurityCard account={primaryAccount} />}
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
