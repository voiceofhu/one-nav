// Lightweight wrappers around Chrome Extension APIs used by OneNav.
// Keep types minimal to avoid additional deps.

export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  parentId?: string;
  dateAdded?: number;
  dateGroupModified?: number;
  children?: BookmarkNode[];
}

type BookmarkChangedCb = () => void;

type Listener<Args extends unknown[]> = {
  addListener(cb: (...args: Args) => void): void;
  removeListener(cb: (...args: Args) => void): void;
};

export interface ChromeTab {
  id?: number;
  url?: string;
  title?: string;
  windowId?: number;
  active?: boolean;
}

interface ChromeBookmarksAPI {
  create(
    createArg: { parentId?: string; title?: string; url?: string },
    callback: (node: BookmarkNode) => void,
  ): void;
  getRecent(
    numberOfItems: number,
    callback: (results: BookmarkNode[]) => void,
  ): void;
  search(
    query: string | { query?: string; url?: string; title?: string },
    callback: (results: BookmarkNode[]) => void,
  ): void;
  onCreated: Listener<[string, BookmarkNode]>;
  onChanged: Listener<[string, { title?: string; url?: string }]>;
  onRemoved: Listener<
    [string, { parentId: string; index: number; node?: BookmarkNode }]
  >;
  onMoved: Listener<
    [
      string,
      {
        parentId: string;
        index: number;
        oldParentId: string;
        oldIndex: number;
      },
    ]
  >;
  onChildrenReordered?: Listener<[string, { childIds: string[] }]>;
  getTree(callback: (results: BookmarkNode[]) => void): void;
  getChildren(id: string, callback: (results: BookmarkNode[]) => void): void;
  getSubTree(id: string, callback: (results: BookmarkNode[]) => void): void;
  move(
    id: string,
    destination: { parentId?: string; index?: number },
    callback: (node: BookmarkNode) => void,
  ): void;
  removeTree(id: string, callback: () => void): void;
  update(
    id: string,
    changes: { title?: string; url?: string },
    callback: (node: BookmarkNode) => void,
  ): void;
  remove(id: string, callback: () => void): void;
}

interface ChromeTabsAPI {
  query(
    queryInfo: { active?: boolean; currentWindow?: boolean },
    callback: (tabs: ChromeTab[]) => void,
  ): void;
  create?(
    createProperties: { url: string },
    callback?: (tab: ChromeTab) => void,
  ): void;
}

interface MinimalChrome {
  bookmarks?: ChromeBookmarksAPI;
  tabs?: ChromeTabsAPI;
  runtime?: {
    id?: string;
    openOptionsPage?: () => void;
    getURL?: (path: string) => string;
  };
}

declare global {
  interface Window {
    chrome?: MinimalChrome;
  }
}

function ensureChrome(): MinimalChrome | undefined {
  // In non-extension contexts (SSR/build), this returns undefined.
  if (typeof window === 'undefined') return undefined;
  return window.chrome;
}

export async function getActiveTab() {
  const ch = ensureChrome();
  const tabs = ch?.tabs;
  if (!tabs?.query) return undefined;
  return new Promise<ChromeTab | undefined>((resolve) => {
    tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs?.[0]);
    });
  });
}

export async function addBookmark(input: {
  title: string;
  url: string;
  parentId?: string;
}) {
  const ch = ensureChrome();
  const bookmarks = ch?.bookmarks;
  if (!bookmarks?.create) throw new Error('Chrome bookmarks API unavailable');
  return new Promise<BookmarkNode>((resolve, reject) => {
    try {
      bookmarks.create(input, (node) => {
        resolve(node);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function addFolder(input: { title: string; parentId?: string }) {
  const ch = ensureChrome();
  const bookmarks = ch?.bookmarks;
  if (!bookmarks?.create) throw new Error('Chrome bookmarks API unavailable');
  return new Promise<BookmarkNode>((resolve, reject) => {
    try {
      bookmarks.create(
        { title: input.title, parentId: input.parentId },
        (node) => {
          resolve(node);
        },
      );
    } catch (e) {
      reject(e);
    }
  });
}

export async function getRecent(limit = 10) {
  const ch = ensureChrome();
  const bookmarks = ch?.bookmarks;
  if (!bookmarks?.getRecent) return [] as BookmarkNode[];
  return new Promise<BookmarkNode[]>((resolve) => {
    bookmarks.getRecent(limit, (nodes) =>
      resolve(nodes as unknown as BookmarkNode[]),
    );
  });
}

export async function searchBookmarks(query: string) {
  const ch = ensureChrome();
  const bookmarks = ch?.bookmarks;
  if (!bookmarks?.search) return [] as BookmarkNode[];
  return new Promise<BookmarkNode[]>((resolve) => {
    bookmarks.search(query, (nodes) =>
      resolve(nodes as unknown as BookmarkNode[]),
    );
  });
}

export async function getTree() {
  const ch = ensureChrome();
  const bookmarks = ch?.bookmarks;
  if (!bookmarks?.getTree) return [] as BookmarkNode[];
  return new Promise<BookmarkNode[]>((resolve) => {
    bookmarks.getTree((nodes) => resolve(nodes as unknown as BookmarkNode[]));
  });
}

export async function getChildren(id: string) {
  const ch = ensureChrome();
  const bookmarks = ch?.bookmarks;
  if (!bookmarks?.getChildren) return [] as BookmarkNode[];
  return new Promise<BookmarkNode[]>((resolve) => {
    bookmarks.getChildren(id, (nodes) =>
      resolve(nodes as unknown as BookmarkNode[]),
    );
  });
}

export async function getNode(id: string) {
  const ch = ensureChrome();
  const bookmarks = ch?.bookmarks;
  if (!bookmarks?.getSubTree)
    return undefined as unknown as BookmarkNode | undefined;
  return new Promise<BookmarkNode | undefined>((resolve) => {
    bookmarks.getSubTree(id, (nodes) =>
      resolve((nodes?.[0] as unknown as BookmarkNode) || undefined),
    );
  });
}

export async function updateBookmark(
  id: string,
  changes: { title?: string; url?: string },
) {
  const ch = ensureChrome();
  const bookmarks = ch?.bookmarks;
  if (!bookmarks?.update) throw new Error('Chrome bookmarks API unavailable');
  return new Promise<BookmarkNode>((resolve, reject) => {
    try {
      bookmarks.update(id, changes, (node) => resolve(node));
    } catch (e) {
      reject(e);
    }
  });
}

export async function removeBookmark(id: string) {
  const ch = ensureChrome();
  const bookmarks = ch?.bookmarks;
  if (!bookmarks?.remove) throw new Error('Chrome bookmarks API unavailable');
  return new Promise<void>((resolve, reject) => {
    try {
      bookmarks.remove(id, () => resolve());
    } catch (e) {
      reject(e);
    }
  });
}

export async function updateFolder(id: string, changes: { title: string }) {
  return updateBookmark(id, { title: changes.title });
}

export async function removeFolder(id: string) {
  const ch = ensureChrome();
  const bookmarks = ch?.bookmarks;
  if (!bookmarks?.removeTree)
    throw new Error('Chrome bookmarks API unavailable');
  return new Promise<void>((resolve, reject) => {
    try {
      bookmarks.removeTree(id, () => resolve());
    } catch (e) {
      reject(e);
    }
  });
}

export async function moveNode(
  id: string,
  destination: { parentId?: string; index?: number },
) {
  const ch = ensureChrome();
  const bookmarks = ch?.bookmarks;
  if (!bookmarks?.move) throw new Error('Chrome bookmarks API unavailable');
  return new Promise<BookmarkNode>((resolve, reject) => {
    try {
      bookmarks.move(id, destination, (node) => resolve(node));
    } catch (e) {
      reject(e);
    }
  });
}

export function onBookmarksChanged(cb: BookmarkChangedCb) {
  const ch = ensureChrome();
  if (!ch?.bookmarks) return () => {};
  const { bookmarks } = ch;
  const hCreated = () => cb();
  const hChanged = () => cb();
  const hRemoved = () => cb();
  const hMoved = () => cb();
  // Some Chromium builds might not support onChildrenReordered
  const hReordered = () => cb();

  bookmarks.onCreated.addListener(hCreated);
  bookmarks.onChanged.addListener(hChanged);
  bookmarks.onRemoved.addListener(hRemoved);
  bookmarks.onMoved.addListener(hMoved);
  bookmarks.onChildrenReordered?.addListener(hReordered);

  return () => {
    bookmarks.onCreated.removeListener(hCreated);
    bookmarks.onChanged.removeListener(hChanged);
    bookmarks.onRemoved.removeListener(hRemoved);
    bookmarks.onMoved.removeListener(hMoved);
    bookmarks.onChildrenReordered?.removeListener(hReordered);
  };
}

export function isExtensionContext() {
  const ch = ensureChrome();
  return Boolean(ch?.runtime?.id);
}

export function openOptionsPage(section?: string) {
  const ch = ensureChrome();
  if (!ch) return;

  const runtime = ch.runtime;
  const tabs = ch.tabs;
  const targetPath = section
    ? `options.html?section=${section}`
    : 'options.html';
  const targetUrl = runtime?.getURL ? runtime.getURL(targetPath) : undefined;

  if (section && tabs?.create && targetUrl) {
    tabs.create({ url: targetUrl });
    return;
  }

  if (runtime?.openOptionsPage) {
    runtime.openOptionsPage();
    return;
  }

  if (typeof window !== 'undefined') {
    const fallbackUrl =
      targetUrl ?? (section ? `/options?section=${section}` : '/options');
    window.open(fallbackUrl, '_blank', 'noopener');
  }
}
