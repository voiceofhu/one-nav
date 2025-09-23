'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, Loader2, ShieldAlert } from 'lucide-react';
import * as React from 'react';

/**
 * ConfirmDialog (Optimized)
 * - 更现代的视觉层次：标题上方图标，柔和圆角与阴影
 * - 清晰的危险态/默认态配色与强调
 * - 移动端优先：按钮自适应宽度、足够触控间距
 * - 交互友好：loading 态禁用关闭、⌘/Ctrl+Enter 确认、Esc/取消
 * - 可选自动聚焦到确认按钮
 */

export type ConfirmDialogTone = 'danger' | 'warning' | 'info' | 'default';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  tone?: ConfirmDialogTone; // 比 variant 更语义化
  autoFocusConfirm?: boolean;
  /**
   * 当 loading 时是否允许点击遮罩/按 Esc 关闭。
   * 通常 destructive 建议 false，避免中断。
   */
  dismissableWhileLoading?: boolean;
  className?: string;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title = '确认操作',
  description,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  tone = 'danger',
  autoFocusConfirm = true,
  dismissableWhileLoading = false,
  className,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const confirmRef = React.useRef<HTMLButtonElement | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  const Icon =
    tone === 'danger'
      ? ShieldAlert
      : tone === 'warning'
        ? AlertTriangle
        : tone === 'info'
          ? Info
          : Info;
  const toneClass =
    tone === 'danger'
      ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950/40'
      : tone === 'warning'
        ? 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/40'
        : tone === 'info'
          ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/40'
          : 'text-primary bg-primary/10';

  // ⌘/Ctrl+Enter 快捷键确认
  React.useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      const metaEnter = e.key === 'Enter' && (e.metaKey || e.ctrlKey);
      if (!open) return;
      if (metaEnter && !loading) {
        e.preventDefault();
        confirmRef.current?.click();
      }
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [open, loading]);

  // DialogContent 的交互拦截（loading 时禁止关闭）
  const preventClose = loading && !dismissableWhileLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => (!preventClose ? onOpenChange(o) : undefined)}
    >
      <DialogContent
        className={cn('sm:max-w-[350px] rounded-2xl p-0 shadow-xl', className)}
        onInteractOutside={(e) => {
          if (preventClose) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (preventClose) e.preventDefault();
        }}
        onOpenAutoFocus={(e) => {
          // 自定义聚焦：优先确认按钮
          if (autoFocusConfirm) {
            e.preventDefault();
            confirmRef.current?.focus();
          }
        }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <div
            className={cn(
              'mx-auto flex h-12 w-12 items-center justify-center rounded-2xl',
              toneClass,
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <DialogTitle className="mt-3 text-center text-[16px] font-semibold tracking-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="px-2 pb-1 text-center text-[13px] text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Footer */}
        <DialogFooter className="flex-row w-full gap-3 px-6 pb-6 sm:justify-center">
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 sm:flex-none w-[120px]"
          >
            {cancelText}
          </Button>

          <Button
            ref={confirmRef}
            type="button"
            variant={tone === 'danger' ? 'destructive' : 'default'}
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
            className="flex-1 sm:flex-none  w-[120px]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                处理中...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
