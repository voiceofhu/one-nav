'use client';

import { BookmarkDetail } from '@/app/popup/components/BookmarkDetail';
import { ContentHeader } from '@/app/popup/components/ContentHeader';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function DetailPage() {
  const params = useSearchParams();
  const id = params.get('id') ?? '';

  if (!id) {
    return (
      <div className="p-4 text-sm text-muted-foreground">缺少 id 参数</div>
    );
  }

  return (
    <div className="p-4">
      <ContentHeader title="Detail" onAddBookmark={() => {}} />
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
