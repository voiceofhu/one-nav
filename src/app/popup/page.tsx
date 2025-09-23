'use client';

import { isExtensionContext, isMock } from '@/extension/data';
import { LockKeyhole } from 'lucide-react';
import { Suspense, useEffect, useMemo, useState } from 'react';

import { AddBookmarkDialog } from './components/AddBookmarkDialog';
import { AddFolderDialog } from './components/AddFolderDialog';
import { BookmarkDetail } from './components/BookmarkDetail';
import { BookmarksList } from './components/BookmarksList';
import { ContentHeader } from './components/ContentHeader';
import {
  useInvalidatePopupData,
  usePopupCategories,
  usePopupList,
} from './hooks/use-popup-data';
import { resolveFolderIdFromCategory } from './lib/bookmark-utils';
import { usePopupState } from './state/popup-state';

export default function PopupPage() {
  const popup = usePopupState();
  const {
    view,
    query,
    categoryId,
    tag,
    detailId,
    runSearch,
    setView,
    setModal,
    closeDetail,
  } = popup;
  const { categories } = usePopupCategories();

  const listQuery = usePopupList({
    view,
    query,
    categoryId,
    tag,
  });
  const invalidate = useInvalidatePopupData();

  const isExt = isExtensionContext() || isMock;
  const items = listQuery.data ?? [];
  const showLoading = listQuery.isLoading || listQuery.isPending;

  const [searchInput, setSearchInput] = useState(query);
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed) {
        if (view !== 'search' || trimmed !== query) {
          runSearch(trimmed);
        }
      } else if (view === 'search' || query) {
        setView('recents');
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput, runSearch, setView, view, query]);

  const isSearching = view === 'search' && Boolean(query);

  function handleSearch() {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      setView('recents');
      return;
    }
    runSearch(trimmed);
  }

  function handleClearSearch() {
    setSearchInput('');
    setView('recents');
  }

  const headingTitle = useMemo(() => {
    switch (view) {
      case 'search':
        return query ? `搜索：${query}` : '最近';
      case 'recents':
        return '最近收藏';
      case 'all':
        return '全部书签';
      case 'category':
        return categories.find((c) => c.id === categoryId)?.label || '分类';
      case 'tag':
        return tag ? `#${tag}` : '标签';
      default:
        return '最近收藏';
    }
  }, [categories, categoryId, query, tag, view]);

  const currentFolderId = useMemo(
    () => resolveFolderIdFromCategory(categoryId),
    [categoryId],
  );

  return (
    <>
      <div className="flex h-full w-full  text-[13px]">
        <div className="flex h-full w-[300px] min-w-[280px] flex-col border-r border-border/50  backdrop-blur">
          <Suspense
            fallback={
              <div className="text-sm p-4 text-muted-foreground">加载中...</div>
            }
          >
            <ContentHeader
              title={headingTitle}
              query={searchInput}
              isSearching={isSearching}
              onQueryChange={setSearchInput}
              onSubmitSearch={handleSearch}
              onClearSearch={handleClearSearch}
              onAddBookmark={() => setModal('addBookmark')}
            />
          </Suspense>
          <div className="flex-1 overflow-y-auto px-3 pb-4 pt-3">
            <Suspense
              fallback={
                <div className="text-sm p-4 text-muted-foreground">
                  加载中...
                </div>
              }
            >
              <BookmarksList
                isExt={isExt}
                showLoading={showLoading}
                items={items}
                onMutate={invalidate}
              />
            </Suspense>
          </div>
        </div>
        <div className="flex h-full min-w-[340px] flex-1 flex-col  backdrop-blur-sm">
          <Suspense
            fallback={
              <div className="text-sm p-4 text-muted-foreground">
                正在加载详情...
              </div>
            }
          >
            {detailId ? (
              <BookmarkDetail
                id={detailId}
                onMutate={invalidate}
                onClose={closeDetail}
              />
            ) : (
              <DetailPlaceholder />
            )}
          </Suspense>
        </div>
      </div>

      <AddFolderDialog
        open={popup.modal === 'addFolder'}
        onOpenChange={(open) => setModal(open ? 'addFolder' : null)}
        currentFolderId={currentFolderId}
        onCreated={async () => {
          await invalidate();
          setModal(null);
        }}
      />
      <AddBookmarkDialog
        open={popup.modal === 'addBookmark'}
        onOpenChange={(open) => setModal(open ? 'addBookmark' : null)}
        currentFolderId={currentFolderId}
        onCreated={async () => {
          await invalidate();
          setModal(null);
        }}
      />
    </>
  );
}

function DetailPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground/80">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
        <LockKeyhole className="h-8 w-8" />
      </div>
      <div>
        <div className="font-semibold text-muted-foreground">
          未选择任何书签
        </div>
        <div className="mt-1 text-xs text-muted-foreground/80">
          点击中间列表中的“详情”按钮即可在此查看。
        </div>
      </div>
    </div>
  );
}
