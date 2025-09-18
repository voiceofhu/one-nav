import type { BookmarkNode } from '@/extension/data';

export type Category = {
  id: string;
  label: string;
  folderId: string;
  mode: 'root-direct' | 'subtree';
};

export type TagItem = {
  name: string;
  count: number;
};

export function flattenBookmarks(tree: BookmarkNode[]): BookmarkNode[] {
  const acc: BookmarkNode[] = [];
  const stack = [...(tree?.[0]?.children || [])];
  while (stack.length) {
    const node = stack.shift()!;
    if (node.url) acc.push(node);
    if (node.children) stack.unshift(...node.children);
  }
  return acc;
}

export function loadCategoryByCatId(
  catId: string,
  tree: BookmarkNode[],
): BookmarkNode[] {
  const isRootDirect = catId.endsWith('-root');
  const parts = catId.replace(/^cat-/, '').split('-');
  const rootId = parts[0];
  const folderId = isRootDirect ? rootId : parts[1];

  if (!folderId) return [];

  if (isRootDirect) {
    const root = findNode(tree, folderId);
    return (root?.children ?? []).filter((n) => !!n.url) as BookmarkNode[];
  }

  const node = findNode(tree, folderId);
  if (!node) return [];

  const acc: BookmarkNode[] = [];
  const stack = [...(node.children ?? [])];
  while (stack.length) {
    const current = stack.shift()!;
    if (current.url) acc.push(current);
    if (current.children) stack.unshift(...current.children);
  }
  return acc;
}

export function loadTagItems(
  tag: string,
  tree: BookmarkNode[],
): BookmarkNode[] {
  const out: BookmarkNode[] = [];
  const stack = [...tree];
  while (stack.length) {
    const node = stack.shift()!;
    if (node.children) stack.unshift(...node.children);
    if (!node.url) continue;
    const tags = extractTags(node.title || '');
    if (tags.includes(tag)) out.push(node);
  }
  return out;
}

export function findNode(
  tree: BookmarkNode[],
  id: string,
): BookmarkNode | undefined {
  const stack = [...tree];
  while (stack.length) {
    const node = stack.shift()!;
    if (node.id === id) return node;
    if (node.children) stack.unshift(...node.children);
  }
  return undefined;
}

export function extractTags(title: string): string[] {
  const out = new Set<string>();
  for (const match of title.matchAll(/\[(.+?)\]/g)) {
    if (match[1]) out.add(match[1].trim());
  }
  for (const match of title.matchAll(/#([^\s#]+)/g)) {
    if (match[1]) out.add(match[1].trim());
  }
  return Array.from(out);
}

export function buildCategories(tree: BookmarkNode[]): Category[] {
  const roots = (tree?.[0]?.children || []).filter((n) => !n.url);
  const categories: Category[] = [];
  for (const root of roots) {
    const hasDirect = (root.children ?? []).some((child) => !!child.url);
    if (hasDirect) {
      categories.push({
        id: `cat-${root.id}-root`,
        label: `${root.title || 'Root'}/根目录`,
        folderId: root.id,
        mode: 'root-direct',
      });
    }
    const subfolders = (root.children ?? []).filter((child) => !child.url);
    for (const folder of subfolders) {
      categories.push({
        id: `cat-${root.id}-${folder.id}`,
        label: `${root.title || 'Root'}/${folder.title || 'Untitled'}`,
        folderId: folder.id,
        mode: 'subtree',
      });
    }
  }
  return categories;
}

export function buildTags(tree: BookmarkNode[]): TagItem[] {
  const counts = new Map<string, number>();
  const stack = [...tree];
  while (stack.length) {
    const node = stack.shift()!;
    if (node.children) stack.unshift(...node.children);
    if (!node.url) continue;
    for (const tag of extractTags(node.title || '')) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

export function resolveFolderIdFromCategory(
  catId?: string,
): string | undefined {
  if (!catId) return undefined;
  const isRootDirect = catId.endsWith('-root');
  const parts = catId.replace(/^cat-/, '').split('-');
  if (parts.length === 0) return undefined;
  return isRootDirect ? parts[0] : (parts[1] ?? parts[0]);
}
