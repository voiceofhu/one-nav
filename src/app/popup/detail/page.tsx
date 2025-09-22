'use client';

import { BookmarkDetail } from '@/app/popup/components/BookmarkDetail';
import { ContentHeader } from '@/app/popup/components/ContentHeader';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

export default function DetailPage() {
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const [query, setQuery] = useState('');

  if (!id) {
    return (
      <div className="p-4 text-sm text-muted-foreground">缺少 id 参数</div>
    );
  }

  return (
    <div className="p-4">
      <ContentHeader
        title="书签详情"
        query={query}
        isSearching={false}
        onQueryChange={setQuery}
        onSubmitSearch={() => {}}
        onClearSearch={() => setQuery('')}
      />
      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">加载中...</div>
        }
      >
        <BookmarkDetail id={id} onMutate={() => {}} />
      </Suspense>
    </div>
  );
}
