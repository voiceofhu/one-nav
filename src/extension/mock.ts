// Mocked data source for local dev and hot reload.
// Provides a subset of Chrome bookmarks APIs using a static JSON tree.
// Tree format mirrors chrome.bookmarks.getTree()
import treeJson from '@/app/popup/tree.json';

import type { BookmarkNode, ChromeTab } from './chrome';

// Keep an in-memory mutable copy to simulate add/remove
type MutableNode = BookmarkNode & { children?: MutableNode[] };
const memoryTree: MutableNode[] = structuredClone(
  treeJson as unknown as MutableNode[],
);

const listeners = new Set<() => void>();

function notifyChanged() {
  for (const cb of Array.from(listeners)) cb();
}

export async function getActiveTab(): Promise<ChromeTab | undefined> {
  return { id: 1, url: 'https://example.com', title: 'Example (Mock)' };
}

export async function addBookmark(input: {
  title: string;
  url: string;
  parentId?: string;
}) {
  const parentId = input.parentId ?? findDefaultParentId();
  const parent = findNode(parentId);
  if (!parent) throw new Error('Mock: parent not found');
  const id = String(Date.now());
  const node: MutableNode = {
    id,
    title: input.title,
    url: input.url,
    parentId,
    dateAdded: Date.now(),
  };
  parent.children = parent.children ?? [];
  parent.children.push(node);
  notifyChanged();
  return node as BookmarkNode;
}

export async function addFolder(input: { title: string; parentId?: string }) {
  const parentId = input.parentId ?? findDefaultParentId();
  const parent = findNode(parentId);
  if (!parent) throw new Error('Mock: parent not found');
  const id = String(Date.now());
  const node: MutableNode = {
    id,
    title: input.title || '未命名目录',
    parentId,
    dateAdded: Date.now(),
    children: [],
  };
  parent.children = parent.children ?? [];
  parent.children.push(node);
  notifyChanged();
  return node as BookmarkNode;
}

export async function getRecent(limit = 10) {
  const all = flatten(memoryTree).filter((n) => !!n.url);
  all.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
  return all.slice(0, limit) as BookmarkNode[];
}

export async function searchBookmarks(query: string) {
  const q = query.toLowerCase();
  const all = flatten(memoryTree).filter((n) => !!n.url);
  return all.filter(
    (n) =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.url || '').toLowerCase().includes(q),
  ) as BookmarkNode[];
}

export async function getTree() {
  return structuredClone(memoryTree) as BookmarkNode[];
}

export async function getChildren(id: string) {
  const node = findNode(id);
  return structuredClone(node?.children ?? []) as BookmarkNode[];
}

export async function getNode(id: string) {
  const node = findNode(id);
  return node ? (structuredClone(node) as BookmarkNode) : undefined;
}

export async function updateBookmark(
  id: string,
  changes: { title?: string; url?: string },
) {
  const node = findNode(id);
  if (!node) throw new Error('Mock: node not found');
  if (typeof changes.title === 'string') node.title = changes.title;
  if (typeof changes.url === 'string') node.url = changes.url;
  notifyChanged();
  return structuredClone(node) as BookmarkNode;
}

export async function removeBookmark(id: string) {
  // remove node from tree
  const stack: MutableNode[] = [...memoryTree];
  while (stack.length) {
    const n = stack.shift()!;
    if (n.children) {
      const idx = n.children.findIndex((c) => c.id === id);
      if (idx >= 0) {
        n.children.splice(idx, 1);
        notifyChanged();
        return;
      }
      stack.unshift(...n.children);
    }
  }
}

export async function updateFolder(id: string, changes: { title: string }) {
  const node = findNode(id);
  if (!node) throw new Error('Mock: node not found');
  node.title = changes.title;
  notifyChanged();
  return structuredClone(node) as BookmarkNode;
}

export async function removeFolder(id: string) {
  const stack: MutableNode[] = [...memoryTree];
  while (stack.length) {
    const n = stack.shift()!;
    if (n.children) {
      const idx = n.children.findIndex((c) => c.id === id);
      if (idx >= 0) {
        if (n.children[idx].children && n.children[idx].children!.length > 0) {
          throw new Error('Mock: cannot delete non-empty folder');
        }
        n.children.splice(idx, 1);
        notifyChanged();
        return;
      }
      stack.unshift(...n.children);
    }
  }
}

export async function moveNode(
  id: string,
  destination: { parentId?: string; index?: number },
) {
  let parent: MutableNode | undefined;
  let node: MutableNode | undefined;
  const todo: MutableNode[] = [...memoryTree];
  while (todo.length) {
    const n = todo.shift()!;
    if (n.children) {
      const i = n.children.findIndex((c) => c.id === id);
      if (i >= 0) {
        parent = n;
        node = n.children.splice(i, 1)[0];
        break;
      }
      todo.unshift(...n.children);
    }
  }
  if (!node) throw new Error('Mock: node not found');
  const destParent = destination.parentId
    ? findNode(destination.parentId)
    : parent;
  if (!destParent) throw new Error('Mock: dest parent not found');
  destParent.children = destParent.children ?? [];
  const index = Math.max(
    0,
    Math.min(
      destination.index ?? destParent.children.length,
      destParent.children.length,
    ),
  );
  destParent.children.splice(index, 0, node);
  node.parentId = destParent.id;
  notifyChanged();
  return structuredClone(node) as BookmarkNode;
}

export function onBookmarksChanged(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function isExtensionContext() {
  // Pretend we are in an extension to suppress preview warning in dev mock
  return true;
}

// Helpers
function findDefaultParentId() {
  // Choose the first top-level folder under the root as default
  const roots = (memoryTree?.[0]?.children || []).filter((n) => !n.url);
  return roots[0]?.id || memoryTree?.[0]?.id || '1';
}

function findNode(id: string): MutableNode | undefined {
  const stack = [...memoryTree];
  while (stack.length) {
    const n = stack.shift()!;
    if (n.id === id) return n;
    if (n.children) stack.unshift(...n.children);
  }
  return undefined;
}

function flatten(nodes: MutableNode[]): MutableNode[] {
  const out: MutableNode[] = [];
  const stack = [...nodes];
  while (stack.length) {
    const n = stack.shift()!;
    out.push(n);
    if (n.children) stack.unshift(...n.children);
  }
  return out;
}
