'use client';

import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import clsx from 'clsx';
import { type CSSProperties, Suspense, useEffect, useState } from 'react';

import LeftSidebar from './components/LeftSidebar';
import { PopupDataListener } from './state/popup-data-listener';
import { PopupStateProvider } from './state/popup-state';

const POPUP_WIDTH = 800;
const POPUP_HEIGHT = 600;
const SIDEBAR_WIDTH = 164;

export default function PopupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', e.reason);
    };
    const handleWindowError = (e: ErrorEvent) => {
      console.error('Window error:', e.error || e.message);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleWindowError);

    return () => {
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection,
      );
      window.removeEventListener('error', handleWindowError);
    };
  }, []);

  if (!mounted) {
    return <div className="p-4 text-sm text-muted-foreground">加载中...</div>;
  }
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <style></style>
      <PopupStateProvider>
        <SidebarProvider
          className="relative overflow-hidden text-[13px] leading-tight"
          style={
            {
              width: POPUP_WIDTH,
              height: POPUP_HEIGHT,
              maxWidth: POPUP_WIDTH,
              maxHeight: POPUP_HEIGHT,
              ['--sidebar-width' as unknown as string]: `${SIDEBAR_WIDTH}px`,
            } as CSSProperties
          }
        >
          <PopupDataListener />
          {/* 背景（可选） */}
          <div className="pointer-events-none absolute inset-0">
            <div className="animated-gradient" />
          </div>

          {/* 主体结构：左侧 Sidebar + 右侧 Inset（children） */}
          <div className="relative z-10 flex h-full w-full">
            <Sidebar
              // collapsible="offcanvas"
              className={clsx(
                ' pointer-events-auto bg-transparent p-0 rounded-none',
              )}
            >
              <Suspense
                fallback={
                  <div className="text-sm p-4 text-muted-foreground">
                    加载中...
                  </div>
                }
              >
                <LeftSidebar />
              </Suspense>
            </Sidebar>

            <SidebarInset className="flex h-full flex-1 overflow-hidden ">
              <Suspense
                fallback={
                  <div className="text-sm p-4 text-muted-foreground">
                    加载中...
                  </div>
                }
              >
                {children}
              </Suspense>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </PopupStateProvider>
    </Suspense>
  );
}
