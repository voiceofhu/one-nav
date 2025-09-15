'use client';

import { Separator } from '@/components/ui/separator';

export function ContentHeader({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-10 -mx-4 px-4 pt-2 pb-2 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">Sort: Date Added</div>
      </div>
      <Separator className="my-2" />
    </div>
  );
}
