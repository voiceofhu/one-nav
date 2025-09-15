import {
  type BookmarkNode,
  getRecent,
  getTree,
  onBookmarksChanged,
} from '@/extension/data';
import { useCallback, useEffect, useState } from 'react';

export function useRecents(limit = 10) {
  const [items, setItems] = useState<BookmarkNode[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const recent = await getRecent(limit);
      let urls = recent.filter((n) => n.url);
      if (urls.length === 0) {
        const tree = await getTree();
        const acc = [] as BookmarkNode[];
        const stack = [...(tree?.[0]?.children || [])];
        while (stack.length && acc.length < limit) {
          const n = stack.shift()!;
          if (n.url) acc.push(n);
          if (n.children) stack.unshift(...n.children);
        }
        urls = acc;
      }
      setItems(urls);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
    const off = onBookmarksChanged(load);
    return off;
  }, [load]);

  return { items, loading, reload: load };
}
