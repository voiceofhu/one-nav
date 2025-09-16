'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {
  type BookmarkNode,
  addBookmark,
  getActiveTab,
  getTree,
  isExtensionContext,
  isMock,
  searchBookmarks,
} from '@/extension/data';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  type CSSProperties,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';

import { AddBookmarkDialog } from './components/AddBookmarkDialog';
import { AddFolderDialog } from './components/AddFolderDialog';
import { AddFolderFooter } from './components/AddFolderFooter';
import { BookmarkDetail } from './components/BookmarkDetail';
import { BookmarksList } from './components/BookmarksList';
import { CategoriesMenu, type Category } from './components/CategoriesMenu';
import { ContentHeader } from './components/ContentHeader';
import { QuickMenu } from './components/QuickMenu';
import { SidebarHeaderSearch } from './components/SidebarHeaderSearch';
import { type TagItem, TagsMenu } from './components/TagsMenu';

export default function Popup() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookmarkNode[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [activeView, setActiveView] = useState<
    | { type: 'all' }
    | { type: 'recents' }
    | { type: 'category'; category: Category }
    | { type: 'tag'; name: string }
  >({ type: 'recents' });
  const [loading, setLoading] = useState(true);
  const [openNewFolder, setOpenNewFolder] = useState(false);
  const [openNewBookmark, setOpenNewBookmark] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const list = useMemo(() => results ?? [], [results]);
  // 添加书签改为在 Dialog 中完成

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const res = await searchBookmarks(query.trim());
    setResults(res.filter((n) => n.url));
  }

  const isExt = isExtensionContext() || isMock;

  function handleAddFolder() {
    setOpenNewFolder(true);
  }

  function clearDetail() {
    // 返回列表：移除 id 参数
    router.replace(pathname);
  }

  // Build categories/tags once
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const tree = await getTree();
        const cats = buildCategories(tree);
        const tgs = buildTags(tree);
        setCategories(cats);
        setTags(tgs);
        // default to recents
        const items = await loadByView({ type: 'recents' }, tree);
        setActiveView({ type: 'recents' });
        setResults(items);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // When active view changes (and not searching), refresh its items
  useEffect(() => {
    (async () => {
      if (query.trim()) return; // searching, don't override list
      const tree = await getTree();
      const items = await loadByView(activeView, tree);
      setResults(items);
    })();
  }, [activeView, query]);

  const headingTitle = query.trim()
    ? 'Search Results'
    : activeView.type === 'recents'
      ? 'Recents'
      : activeView.type === 'all'
        ? 'All Bookmarks'
        : activeView.type === 'category'
          ? activeView.category.label
          : `#${activeView.name}`;

  const displayItems = (results ?? list) as BookmarkNode[];

  return (
    <SidebarProvider
      className="relative overflow-hidden w-[615px]  h-[560px]  "
      style={
        { ['--sidebar-width' as unknown as string]: '170px' } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="animated-gradient" />
      </div>
      <div className="relative z-10 flex h-full w-full">
        <Sidebar
          collapsible="none"
          variant="floating"
          className="border-r bg-background/40 backdrop-blur pointer-events-auto"
        >
          <SidebarHeaderSearch
            query={query}
            onQueryChange={(v) => setQuery(v)}
            onSearch={() => void handleSearch()}
          />
          <SidebarContent className="px-2 text-[12px]">
            <QuickMenu
              active={
                activeView.type === 'all' || activeView.type === 'recents'
                  ? activeView.type
                  : null
              }
              onSelectAll={() => {
                setQuery('');
                setResults(null);
                setActiveView({ type: 'all' });
                clearDetail();
              }}
              onSelectRecents={() => {
                setQuery('');
                setResults(null);
                setActiveView({ type: 'recents' });
                clearDetail();
              }}
            />
            <CategoriesMenu
              categories={categories}
              activeId={
                activeView.type === 'category'
                  ? activeView.category.id
                  : undefined
              }
              onSelect={(c) => {
                setQuery('');
                setResults(null);
                setActiveView({ type: 'category', category: c });
                clearDetail();
              }}
              onMutate={async () => {
                const tree = await getTree();
                const cats = buildCategories(tree);
                setCategories(cats);
                // If current active category no longer exists, fallback to recents
                if (
                  activeView.type === 'category' &&
                  !cats.find((x) => x.id === activeView.category.id)
                ) {
                  setActiveView({ type: 'recents' });
                  setResults(await loadByView({ type: 'recents' }, tree));
                } else {
                  setResults(await loadByView(activeView, tree));
                }
              }}
            />
            <TagsMenu
              tags={tags}
              activeName={
                activeView.type === 'tag' ? activeView.name : undefined
              }
              onSelect={(t) => {
                setQuery('');
                setResults(null);
                setActiveView({ type: 'tag', name: t.name });
                clearDetail();
              }}
            />
          </SidebarContent>
          <AddFolderFooter
            onAddFolder={handleAddFolder}
            onOpenSettings={() => alert('设置页开发中')}
          />
        </Sidebar>
        <SidebarInset className="h-full overflow-auto bg-background/60">
          <div className="pb-4">
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">加载中...</div>
              }
            >
              <ContentHeader
                title={headingTitle}
                onAddBookmark={() => setOpenNewBookmark(true)}
              />
              <RightPane
                isExt={isExt}
                loading={Boolean(loading && !results)}
                items={displayItems}
                reload={async () => {
                  const tree = await getTree();
                  setResults(await loadByView(activeView, tree));
                }}
                sortableParentId={
                  activeView.type === 'category' &&
                  activeView.category.mode === 'root-direct'
                    ? activeView.category.folderId
                    : undefined
                }
              />
            </Suspense>
          </div>
        </SidebarInset>
      </div>
      <AddFolderDialog
        open={openNewFolder}
        onOpenChange={setOpenNewFolder}
        currentFolderId={
          activeView.type === 'category'
            ? activeView.category.folderId
            : undefined
        }
        onCreated={async (folder) => {
          const tree = await getTree();
          const cats = buildCategories(tree);
          setCategories(cats);
          const cat = cats.find((c) => c.folderId === folder.id);
          if (cat) {
            setActiveView({ type: 'category', category: cat });
            setResults(
              await loadByView({ type: 'category', category: cat }, tree),
            );
          }
        }}
      />
      <AddBookmarkDialog
        open={openNewBookmark}
        onOpenChange={setOpenNewBookmark}
        currentFolderId={
          activeView.type === 'category'
            ? activeView.category.folderId
            : undefined
        }
        onCreated={async (node) => {
          const tree = await getTree();
          setResults(await loadByView(activeView, tree));
        }}
      />
    </SidebarProvider>
  );
}

function RightPane({
  isExt,
  loading,
  items,
  reload,
  sortableParentId,
}: {
  isExt: boolean;
  loading: boolean;
  items: BookmarkNode[];
  reload: () => Promise<void> | void;
  sortableParentId?: string;
}) {
  // useSearchParams requires Suspense boundary; this component is inside Suspense
  const params = useSearchParams();
  const detailId = params.get('id');
  if (detailId) {
    return <BookmarkDetail id={detailId} onMutate={reload} />;
  }
  return (
    <BookmarksList
      isExt={isExt}
      showLoading={loading}
      items={items}
      onMutate={reload}
      sortableParentId={sortableParentId}
    />
  );
}

// Build two-level categories: "Root/Child" (root-direct shows bookmarks directly under root)
function buildCategories(tree: BookmarkNode[]): Category[] {
  const roots = (tree?.[0]?.children || []).filter((n) => !n.url);
  const cats: Category[] = [];
  for (const r of roots) {
    const hasDirect = (r.children ?? []).some((c) => !!c.url);
    if (hasDirect) {
      cats.push({
        id: `cat-${r.id}-root`,
        label: `${r.title || 'Root'}/根目录`,
        folderId: r.id,
        mode: 'root-direct',
      });
    }
    const subfolders = (r.children ?? []).filter((c) => !c.url);
    for (const f of subfolders) {
      cats.push({
        id: `cat-${r.id}-${f.id}`,
        label: `${r.title || 'Root'}/${f.title || 'Untitled'}`,
        folderId: f.id,
        mode: 'subtree',
      });
    }
  }
  return cats;
}

async function loadCategoryItems(cat: Category, tree?: BookmarkNode[]) {
  const t = tree ?? (await getTree());
  if (cat.mode === 'root-direct') {
    const root = findNode(t, cat.folderId);
    const urls = (root?.children ?? []).filter(
      (n) => !!n.url,
    ) as BookmarkNode[];
    return urls;
  }
  // subtree: gather all urls inside the folder
  const node = findNode(t, cat.folderId);
  const acc: BookmarkNode[] = [];
  const stack = [...(node?.children ?? [])];
  while (stack.length) {
    const n = stack.shift()!;
    if (n.url) acc.push(n);
    if (n.children) stack.unshift(...n.children);
  }
  return acc;
}

function buildTags(tree: BookmarkNode[]): TagItem[] {
  const counts = new Map<string, number>();
  const stack = [...tree];
  while (stack.length) {
    const n = stack.shift()!;
    if (n.children) stack.unshift(...n.children);
    if (!n.url) continue;
    for (const t of extractTags(n.title || '')) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

function extractTags(title: string): string[] {
  const out = new Set<string>();
  // [tag]
  const bracket = title.matchAll(/\[(.+?)\]/g);
  for (const m of bracket) if (m[1]) out.add(m[1].trim());
  // #tag (until whitespace or #)
  const hash = title.matchAll(/#([^\s#]+)/g);
  for (const m of hash) if (m[1]) out.add(m[1].trim());
  return Array.from(out);
}

async function loadByView(
  view:
    | { type: 'all' }
    | { type: 'recents' }
    | { type: 'category'; category: Category }
    | { type: 'tag'; name: string },
  tree?: BookmarkNode[],
) {
  if (view.type === 'category') return loadCategoryItems(view.category, tree);
  const t = tree ?? (await getTree());
  if (view.type === 'all') {
    const acc: BookmarkNode[] = [];
    const stack = [...(t?.[0]?.children || [])];
    while (stack.length) {
      const n = stack.shift()!;
      if (n.url) acc.push(n);
      if (n.children) stack.unshift(...n.children);
    }
    return acc;
  }
  if (view.type === 'recents') {
    const { getRecent } = await import('@/extension/data');
    return getRecent(50);
  }
  return loadTagItems(view.name, t);
}

function loadTagItems(tag: string, tree: BookmarkNode[]) {
  const out: BookmarkNode[] = [];
  const stack = [...tree];
  while (stack.length) {
    const n = stack.shift()!;
    if (n.children) stack.unshift(...n.children);
    if (!n.url) continue;
    const tags = extractTags(n.title || '');
    if (tags.includes(tag)) out.push(n);
  }
  return out;
}

function findNode(tree: BookmarkNode[], id: string): BookmarkNode | undefined {
  const stack = [...tree];
  while (stack.length) {
    const n = stack.shift()!;
    if (n.id === id) return n;
    if (n.children) stack.unshift(...n.children);
  }
  return undefined;
}
