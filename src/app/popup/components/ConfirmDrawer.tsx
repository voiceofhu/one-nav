'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useState } from 'react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDrawer({
  open,
  onOpenChange,
  title = '确认删除',
  description,
  confirmText = '删除',
  cancelText = '取消',
  onConfirm,
}: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <Drawer direction="top" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="sm:max-w-md shadow-lg max-h-[50vh]">
        <DrawerHeader className="relative pb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute left-3 top-3"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <DrawerTitle className="text-center">{title}</DrawerTitle>
          <Button
            type="button"
            size="sm"
            className="absolute right-3 top-3"
            variant="destructive"
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true);
                await onConfirm();
                onOpenChange(false);
              } finally {
                setLoading(false);
              }
            }}
          >
            {confirmText}
          </Button>
        </DrawerHeader>
        <div className="px-4 pb-4">
          {description ? (
            <div className="text-sm text-muted-foreground leading-6">
              {description}
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default ConfirmDrawer;
