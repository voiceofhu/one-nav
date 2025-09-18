'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
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

  const replaceSearch = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      updater(next);
      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [params, pathname, router],
  );

  const modalParam = params.get('modal');
  const modal: PopupModal =
    modalParam === 'addFolder' || modalParam === 'addBookmark'
      ? (modalParam as PopupModal)
      : null;

  const value = useMemo<PopupStateValue>(() => {
    const viewParam = params.get('view');
    const view: PopupView =
      viewParam === 'all' ||
      viewParam === 'search' ||
      viewParam === 'category' ||
      viewParam === 'tag'
        ? (viewParam as PopupView)
        : 'recents';

    const query = params.get('q') ?? '';
    const categoryId = params.get('categoryId') ?? undefined;
    const tag = params.get('tag') ?? undefined;
    const detailId = params.get('id') ?? undefined;

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
  }, [modal, params, replaceSearch]);

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
