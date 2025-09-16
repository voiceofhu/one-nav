'use client';

import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function ContentHeader({
  title,
  onAddBookmark,
}: {
  title: string;
  onAddBookmark?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const inDetail = Boolean(params.get('id'));

  function goBack() {
    const sp = new URLSearchParams(params.toString());
    sp.delete('id');
    router.replace(sp.toString() ? `${pathname}?${sp.toString()}` : pathname);
  }

  return (
    <div className="sticky top-0 z-10 px-4 pt-2 pb-2  backdrop-blur supports-[backdrop-filter]:bg-background/90 rounded-br-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {inDetail && (
            <button
              className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent"
              onClick={goBack}
              title="返回"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="text-base font-semibold truncate">{title}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground hidden md:block">
            按添加时间排序
          </div>
          {!inDetail && onAddBookmark && (
            <button
              className="text-xs h-7 px-2 rounded-md bg-primary text-white hover:opacity-90"
              onClick={() => onAddBookmark?.()}
            >
              + 添加书签
            </button>
          )}
        </div>
      </div>
      {/* <Separator className="my-2" /> */}
    </div>
  );
}
