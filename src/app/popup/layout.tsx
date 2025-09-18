'use client';

import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import clsx from 'clsx';
import { type CSSProperties, Suspense, useEffect } from 'react';

import LeftSidebar from './components/LeftSidebar';
import { PopupDataListener } from './state/popup-data-listener';
import { PopupStateProvider } from './state/popup-state';

const POPUP_WIDTH = 615;
const POPUP_HEIGHT = 560;
const SIDEBAR_WIDTH = 170;

export default function PopupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled rejection:', e.reason);
    });
    window.addEventListener('error', (e) => {
      console.error('Window error:', e.error || e.message);
    });
  }, []);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PopupStateProvider>
        <SidebarProvider
          className="relative overflow-hidden"
          style={
            {
              width: POPUP_WIDTH,
              height: POPUP_HEIGHT,
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
              collapsible="none"
              variant="floating"
              className={clsx(
                'border-r bg-background/40 backdrop-blur pointer-events-auto',
              )}
            >
              <Suspense
                fallback={
                  <div className="text-sm text-muted-foreground">加载中...</div>
                }
              >
                <LeftSidebar />
              </Suspense>
            </Sidebar>

            <SidebarInset className="h-full overflow-auto bg-background/60">
              <Suspense
                fallback={
                  <div className="text-sm text-muted-foreground">加载中...</div>
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
