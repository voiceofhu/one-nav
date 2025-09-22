'use client';

import { SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { Bookmark } from 'lucide-react';

import { CategoriesMenu } from '../components/CategoriesMenu';
import { QuickMenu } from '../components/QuickMenu';
import { TagsMenu } from '../components/TagsMenu';
import {
  useInvalidatePopupData,
  usePopupCategories,
  usePopupTags,
} from '../hooks/use-popup-data';
import { usePopupState } from '../state/popup-state';
import { FolderFooter } from './FolderFooter';

export default function LeftSidebar() {
  const { view, categoryId, tag, setView, setModal } = usePopupState();
  const { categories } = usePopupCategories();
  const { tags } = usePopupTags();
  const invalidate = useInvalidatePopupData();

  const activeQuick = view === 'all' || view === 'recents' ? view : null;
  const activeCategoryId = view === 'category' ? categoryId : undefined;
  const activeTagName = view === 'tag' ? tag : undefined;

  return (
    <>
      <SidebarHeader className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          {/* <Bookmark className="h-5 w-5 text-primary" /> */}
          {/* OneNav */}
          <img src="/header.png" alt="" className="h-9 " />
        </div>
        {/* <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Bookmark className="h-3.5 w-3.5 opacity-70" />
          高效管理你的书签
        </p> */}
      </SidebarHeader>

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
