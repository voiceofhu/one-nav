'use client';

import { onBookmarksChanged } from '@/extension/data';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  POPUP_LIST_QUERY_KEY,
  POPUP_TREE_QUERY_KEY,
} from '../hooks/use-popup-data';

export function PopupDataListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onBookmarksChanged(() => {
      queryClient.invalidateQueries({ queryKey: POPUP_TREE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: POPUP_LIST_QUERY_KEY });
    });
    return unsubscribe;
  }, [queryClient]);

  return null;
}
