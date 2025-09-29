'use client';

import { getPopupStateParams, setPopupStateParams } from '@/extension/storage';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type PopupView = 'recents' | 'all' | 'search' | 'category' | 'tag';
type PopupModal = 'addFolder' | 'addBookmark' | null;

type PopupStateValue = {
  view: PopupView;
  query: string;
  categoryId?: string;
  tag?: string;
  detailId?: string;
  modal: PopupModal;
  setView: (
    view: PopupView,
    options?: { categoryId?: string; tag?: string; query?: string },
  ) => void;
  runSearch: (query: string) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  setModal: (modal: PopupModal) => void;
  replaceSearch: (updater: (params: URLSearchParams) => void) => void;
};

const PopupStateContext = createContext<PopupStateValue | undefined>(undefined);

export function PopupStateProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramsString = params.toString();

  const [shouldSyncUrl, setShouldSyncUrl] = useState(false);
  const [localParams, setLocalParams] = useState<URLSearchParams>(
    () => new URLSearchParams(paramsString),
  );
  const [hasLoadedPersistentState, setHasLoadedPersistentState] =
    useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setShouldSyncUrl(window.location.protocol !== 'chrome-extension:');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.protocol !== 'chrome-extension:') {
      setHasLoadedPersistentState(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const stored = await getPopupStateParams();
        if (cancelled) return;
        if (stored && !paramsString) {
          setLocalParams(new URLSearchParams(stored));
        }
      } finally {
        if (!cancelled) {
          setHasLoadedPersistentState(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paramsString]);

  useEffect(() => {
    if (!hasLoadedPersistentState) return;
    if (typeof window === 'undefined') return;
    if (window.location.protocol !== 'chrome-extension:') return;
    const snapshot = localParams.toString();
    void setPopupStateParams(snapshot || null);
  }, [localParams, hasLoadedPersistentState]);

  useEffect(() => {
    if (shouldSyncUrl) {
      setLocalParams(new URLSearchParams(paramsString));
    }
  }, [paramsString, shouldSyncUrl]);

  const activeParams = useMemo(() => {
    return shouldSyncUrl ? new URLSearchParams(paramsString) : localParams;
  }, [localParams, paramsString, shouldSyncUrl]);

  const replaceSearch = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      if (!shouldSyncUrl) {
        setLocalParams((prev) => {
          const nextParams = new URLSearchParams(prev.toString());
          updater(nextParams);
          return nextParams;
        });
        return;
      }

      const next = new URLSearchParams(paramsString);
      updater(next);
      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [paramsString, pathname, router, shouldSyncUrl],
  );

  const modalParam = activeParams.get('modal');
  const modal: PopupModal =
    modalParam === 'addFolder' || modalParam === 'addBookmark'
      ? (modalParam as PopupModal)
      : null;

  const value = useMemo<PopupStateValue>(() => {
    const viewParam = activeParams.get('view');
    const view: PopupView =
      viewParam === 'all' ||
      viewParam === 'search' ||
      viewParam === 'category' ||
      viewParam === 'tag'
        ? (viewParam as PopupView)
        : 'recents';

    const query = activeParams.get('q') ?? '';
    const categoryId = activeParams.get('categoryId') ?? undefined;
    const tag = activeParams.get('tag') ?? undefined;
    const detailId = activeParams.get('id') ?? undefined;

    const setView: PopupStateValue['setView'] = (nextView, options) => {
      replaceSearch((sp) => {
        sp.set('view', nextView);
        sp.delete('modal');
        if (nextView === 'search') {
          const nextQuery = options?.query?.trim() ?? '';
          if (nextQuery) {
            sp.set('q', nextQuery);
          } else {
            sp.delete('q');
            sp.set('view', 'recents');
          }
          sp.delete('categoryId');
          sp.delete('tag');
        } else if (nextView === 'category') {
          if (options?.categoryId) {
            sp.set('categoryId', options.categoryId);
          } else {
            sp.delete('categoryId');
          }
          sp.delete('tag');
          sp.delete('q');
        } else if (nextView === 'tag') {
          if (options?.tag) {
            sp.set('tag', options.tag);
          } else {
            sp.delete('tag');
          }
          sp.delete('categoryId');
          sp.delete('q');
        } else {
          sp.delete('q');
          sp.delete('categoryId');
          sp.delete('tag');
        }
        sp.delete('id');
      });
    };

    const runSearch: PopupStateValue['runSearch'] = (input) => {
      const trimmed = input.trim();
      if (!trimmed) {
        setView('recents');
        return;
      }
      setView('search', { query: trimmed });
    };

    const openDetail: PopupStateValue['openDetail'] = (id) => {
      replaceSearch((sp) => {
        sp.set('id', id);
      });
    };

    const closeDetail: PopupStateValue['closeDetail'] = () => {
      replaceSearch((sp) => {
        sp.delete('id');
      });
    };

    const setModal: PopupStateValue['setModal'] = (nextModal) => {
      replaceSearch((sp) => {
        if (nextModal) {
          sp.set('modal', nextModal);
        } else {
          sp.delete('modal');
        }
      });
    };

    return {
      view,
      query,
      categoryId,
      tag,
      detailId,
      modal,
      setView,
      runSearch,
      openDetail,
      closeDetail,
      setModal,
      replaceSearch,
    };
  }, [activeParams, modal, replaceSearch]);

  return (
    <PopupStateContext.Provider value={value}>
      {children}
    </PopupStateContext.Provider>
  );
}

export function usePopupState() {
  const ctx = useContext(PopupStateContext);
  if (!ctx)
    throw new Error('usePopupState must be used within PopupStateProvider');
  return ctx;
}

export type { PopupModal, PopupView };
