'use client';

import clsx from 'clsx';
import { type ReactNode } from 'react';

interface BookmarkSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function BookmarkSection({
  children,
  className,
  title,
  subtitle,
  actions,
}: BookmarkSectionProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-gray-200/60 mx-2 bg-white/80 backdrop-blur-sm px-4 py-4  dark:border-gray-700/60 dark:bg-gray-900/80',
        className,
      )}
    >
      {(title || subtitle || actions) && (
        <div className="mb-3 flex items-center justify-between">
          <div>
            {title && (
              <div className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-[11px] font-normal text-gray-500 dark:text-gray-400">
                {subtitle}
              </div>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-1.5">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
