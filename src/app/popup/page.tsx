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
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AddBookmarkFooter } from './components/AddBookmarkFooter';
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

  const list = useMemo(() => results ?? [], [results]);
  async function handleAddCurrent() {
    try {
      const tab = await getActiveTab();
      if (!tab?.url) {
        toast.error('无法获取当前标签页');
        return;
      }
      const title = tab.title || new URL(tab.url).hostname;
      await addBookmark({
        title,
        url: tab.url,
        parentId:
          activeView.type === 'category'
            ? activeView.category.folderId
            : undefined,
      });
      toast.success('已添加到书签');
      // reload for current view
      const tree = await getTree();
      const items = await loadByView(activeView, tree);
      setResults(items);
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message);
      else toast.error('添加失败');
    }
  }

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
    <SidebarProvider className="min-w-[680px] max-w-[820px] h-[600px] max-h-[600px] border">
      <Sidebar collapsible="none" variant="floating">
        <SidebarHeaderSearch
          query={query}
          onQueryChange={(v) => setQuery(v)}
          onSearch={() => void handleSearch()}
        />
        <SidebarContent className="px-2">
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
            }}
            onSelectRecents={() => {
              setQuery('');
              setResults(null);
              setActiveView({ type: 'recents' });
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
            }}
          />
          <TagsMenu
            tags={tags}
            activeName={activeView.type === 'tag' ? activeView.name : undefined}
            onSelect={(t) => {
              setQuery('');
              setResults(null);
              setActiveView({ type: 'tag', name: t.name });
            }}
          />
        </SidebarContent>
        <AddBookmarkFooter onAdd={handleAddCurrent} />
      </Sidebar>
      <SidebarInset className="h-full overflow-auto">
        <div className="p-4">
          <ContentHeader title={headingTitle} />
          <BookmarksList
            isExt={isExt}
            showLoading={Boolean(loading && !results)}
            items={displayItems}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
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
