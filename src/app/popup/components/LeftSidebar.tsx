'use client';

import { SidebarContent } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

import { CategoriesMenu } from '../components/CategoriesMenu';
import { QuickMenu } from '../components/QuickMenu';
import { SidebarHeaderSearch } from '../components/SidebarHeaderSearch';
import { TagsMenu } from '../components/TagsMenu';
import {
  useInvalidatePopupData,
  usePopupCategories,
  usePopupTags,
} from '../hooks/use-popup-data';
import { usePopupState } from '../state/popup-state';
import { FolderFooter } from './FolderFooter';

export default function LeftSidebar() {
  const {
    view,
    categoryId,
    tag,
    query: activeQuery,
    setView,
    runSearch,
    setModal,
  } = usePopupState();
  const [query, setQuery] = useState(activeQuery);
  const { categories } = usePopupCategories();
  const { tags } = usePopupTags();
  const invalidate = useInvalidatePopupData();

  useEffect(() => {
    setQuery(activeQuery);
  }, [activeQuery]);

  const activeQuick = view === 'all' || view === 'recents' ? view : null;
  const activeCategoryId = view === 'category' ? categoryId : undefined;
  const activeTagName = view === 'tag' ? tag : undefined;

  function handleSearch() {
    runSearch(query);
  }

  return (
    <>
      <SidebarHeaderSearch
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
      />

      <SidebarContent className="px-2 text-[12px]">
        <QuickMenu
          active={activeQuick}
          onSelectAll={() => setView('all')}
          onSelectRecents={() => setView('recents')}
        />

        <CategoriesMenu
          categories={categories}
          activeId={activeCategoryId}
          onSelect={(category) =>
            setView('category', { categoryId: category.id })
          }
          onMutate={invalidate}
        />

        <TagsMenu
          tags={tags}
          activeName={activeTagName}
          onSelect={(t) => setView('tag', { tag: t.name })}
        />
      </SidebarContent>

      <FolderFooter onAddFolder={() => setModal('addFolder')} />
    </>
  );
}
