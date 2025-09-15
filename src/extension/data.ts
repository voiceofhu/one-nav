// Unified data source that uses real Chrome APIs in extension context,
// and a fast mock in local dev.
import type { ChromeTab } from './chrome';
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

const api = shouldUseMock() ? mockApi : chromeApi;

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
