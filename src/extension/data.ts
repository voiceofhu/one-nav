// Unified data source that uses real Chrome APIs in extension context,
// and a fast mock in local dev.
import type { BookmarkNode, ChromeTab } from './chrome';
import * as chromeApi from './chrome';
import * as mockApi from './mock';

function shouldUseMock() {
  // Prefer mock when not in extension context
  try {
    return !chromeApi.isExtensionContext();
  } catch {
    return true;
  }
}

type DataAdapter = {
  isExtensionContext(): boolean;
  getActiveTab(): Promise<ChromeTab | undefined>;
  addBookmark(input: {
    title: string;
    url: string;
    parentId?: string;
  }): Promise<BookmarkNode>;
  addFolder(input: { title: string; parentId?: string }): Promise<BookmarkNode>;
  getRecent(limit?: number): Promise<BookmarkNode[]>;
  searchBookmarks(query: string): Promise<BookmarkNode[]>;
  getTree(): Promise<BookmarkNode[]>;
  getChildren(id: string): Promise<BookmarkNode[]>;
  onBookmarksChanged(cb: () => void): () => void;
  getNode(id: string): Promise<BookmarkNode | undefined>;
  updateBookmark(
    id: string,
    changes: { title?: string; url?: string },
  ): Promise<BookmarkNode>;
  removeBookmark(id: string): Promise<void>;
  updateFolder(id: string, changes: { title: string }): Promise<BookmarkNode>;
  removeFolder(id: string): Promise<void>;
  moveNode(
    id: string,
    destination: { parentId?: string; index?: number },
  ): Promise<BookmarkNode>;
};

const api: DataAdapter = (
  shouldUseMock() ? (mockApi as unknown) : (chromeApi as unknown)
) as DataAdapter;

export { type BookmarkNode } from './chrome';

export const isMock = shouldUseMock();

export function isExtensionContext() {
  // Delegate to the underlying api
  return api.isExtensionContext();
}

export async function getActiveTab(): Promise<ChromeTab | undefined> {
  return api.getActiveTab();
}

export async function addBookmark(input: {
  title: string;
  url: string;
  parentId?: string;
}) {
  return api.addBookmark(input);
}

export async function addFolder(input: { title: string; parentId?: string }) {
  return api.addFolder(input);
}

export async function getRecent(limit = 10) {
  return api.getRecent(limit);
}

export async function searchBookmarks(query: string) {
  return api.searchBookmarks(query);
}

export async function getTree() {
  return api.getTree();
}

export async function getChildren(id: string) {
  return api.getChildren(id);
}

export function onBookmarksChanged(cb: () => void) {
  return api.onBookmarksChanged(cb);
}

export async function getNode(id: string) {
  return api.getNode(id);
}

export async function updateBookmark(
  id: string,
  changes: { title?: string; url?: string },
) {
  return api.updateBookmark(id, changes);
}

export async function removeBookmark(id: string) {
  return api.removeBookmark(id);
}

export async function updateFolder(id: string, changes: { title: string }) {
  return api.updateFolder(id, changes);
}

export async function removeFolder(id: string) {
  return api.removeFolder(id);
}

export async function moveNode(
  id: string,
  destination: { parentId?: string; index?: number },
) {
  return api.moveNode(id, destination);
}
