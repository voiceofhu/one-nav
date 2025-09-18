'use client';

import {
  type BookmarkNode,
  getRecent,
  getTree,
  searchBookmarks,
} from '@/extension/data';
import {
  type QueryKey,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  type Category,
  type TagItem,
  buildCategories,
  buildTags,
  flattenBookmarks,
  loadCategoryByCatId,
  loadTagItems,
} from '../lib/bookmark-utils';
import { type PopupView } from '../state/popup-state';

const POPUP_TREE_QUERY_KEY = ['popup', 'tree'] as const;
const POPUP_LIST_QUERY_KEY = ['popup', 'list'] as const;

const popupTreeQueryOptions = queryOptions({
  queryKey: POPUP_TREE_QUERY_KEY,
  queryFn: getTree,
  staleTime: 60 * 1000,
});

export function usePopupTree() {
  return useQuery(popupTreeQueryOptions);
}

export function usePopupCategories() {
  const query = usePopupTree();
  const categories = query.data ? buildCategories(query.data) : [];
  return {
    categories,
    ...query,
  } satisfies typeof query & { categories: Category[] };
}

export function usePopupTags() {
  const query = usePopupTree();
  const tags = query.data ? buildTags(query.data) : [];
  return {
    tags,
    ...query,
  } satisfies typeof query & { tags: TagItem[] };
}

type PopupListParams = {
  view: PopupView;
  query: string;
  categoryId?: string;
  tag?: string;
};

const RECENT_LIMIT = 50;

export function usePopupList(params: PopupListParams) {
  const queryClient = useQueryClient();
  const queryKey = [
    ...POPUP_LIST_QUERY_KEY,
    params.view,
    params.query,
    params.categoryId ?? null,
    params.tag ?? null,
  ] as QueryKey;

  return useQuery({
    queryKey,
    enabled: params.view !== 'search' || Boolean(params.query.trim()),
    queryFn: async () => {
      if (params.view === 'search') {
        const searchResult = await searchBookmarks(params.query.trim());
        return searchResult.filter((node) => !!node.url) as BookmarkNode[];
      }

      if (params.view === 'recents') {
        return getRecent(RECENT_LIMIT);
      }

      const tree = await queryClient.ensureQueryData(popupTreeQueryOptions);

      if (params.view === 'all') {
        return flattenBookmarks(tree);
      }

      if (params.view === 'category' && params.categoryId) {
        return loadCategoryByCatId(params.categoryId, tree);
      }

      if (params.view === 'tag' && params.tag) {
        return loadTagItems(params.tag, tree);
      }

      return getRecent(RECENT_LIMIT);
    },
  });
}

export function useInvalidatePopupData() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: POPUP_TREE_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: POPUP_LIST_QUERY_KEY }),
    ]);
  };
}

export { POPUP_LIST_QUERY_KEY, POPUP_TREE_QUERY_KEY, popupTreeQueryOptions };
