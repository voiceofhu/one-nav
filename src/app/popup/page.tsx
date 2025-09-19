'use client';

import { isExtensionContext, isMock } from '@/extension/data';
import { Suspense, useMemo } from 'react';

import { AddBookmarkDialog } from './components/AddBookmarkDialog';
import { AddFolderDialog } from './components/AddFolderDialog';
import { BookmarkDetail } from './components/BookmarkDetail';
import { BookmarksList } from './components/BookmarksList';
import { ContentHeader } from './components/ContentHeader';
import { useInvalidatePopupData, usePopupList } from './hooks/use-popup-data';
import { resolveFolderIdFromCategory } from './lib/bookmark-utils';
import { usePopupState } from './state/popup-state';

export default function PopupPage() {
  const popup = usePopupState();
  const listQuery = usePopupList({
    view: popup.view,
    query: popup.query,
    categoryId: popup.categoryId,
    tag: popup.tag,
  });
  const invalidate = useInvalidatePopupData();

  const isExt = isExtensionContext() || isMock;
  const items = listQuery.data ?? [];
  const showLoading = listQuery.isLoading || listQuery.isPending;

  const headingTitle = useMemo(() => {
    switch (popup.view) {
      case 'search':
        return popup.query ? 'Search Results' : 'Recents';
      case 'recents':
        return 'Recents';
      case 'all':
        return 'All Bookmarks';
      case 'category':
        return 'Category';
      case 'tag':
        return popup.tag ? `#${popup.tag}` : 'Tags';
      default:
        return 'Recents';
    }
  }, [popup.query, popup.tag, popup.view]);

  const currentFolderId = useMemo(
    () => resolveFolderIdFromCategory(popup.categoryId),
    [popup.categoryId],
  );

  return (
    <>
      <div className="pb-4">
        <Suspense
          fallback={
            <div className="text-sm p-4 text-muted-foreground">加载中...</div>
          }
        >
          <ContentHeader
            title={headingTitle}
            onAddBookmark={() => popup.setModal('addBookmark')}
          />
          {popup.detailId ? (
            <BookmarkDetail id={popup.detailId} onMutate={invalidate} />
          ) : (
            <BookmarksList
              isExt={isExt}
              showLoading={showLoading}
              items={items}
              onMutate={invalidate}
            />
          )}
        </Suspense>
      </div>

      <AddFolderDialog
        open={popup.modal === 'addFolder'}
        onOpenChange={(open) => popup.setModal(open ? 'addFolder' : null)}
        currentFolderId={currentFolderId}
        onCreated={async () => {
          await invalidate();
          popup.setModal(null);
        }}
      />
      <AddBookmarkDialog
        open={popup.modal === 'addBookmark'}
        onOpenChange={(open) => popup.setModal(open ? 'addBookmark' : null)}
        currentFolderId={currentFolderId}
        onCreated={async () => {
          await invalidate();
          popup.setModal(null);
        }}
      />
    </>
  );
}
