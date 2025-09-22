'use client';

import clsx from 'clsx';
import { type ReactNode } from 'react';

interface FieldSectionProps {
  children: ReactNode;
  variant?: 'card' | 'plain';
  className?: string;
}

export function FieldSection({
  children,
  variant = 'card',
  className,
}: FieldSectionProps) {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-xl',
        variant === 'card'
          ? 'border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/60'
          : 'bg-transparent',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface FieldRowProps {
  label: string;
  children: ReactNode;
  actions?: ReactNode;
  direction?: 'vertical' | 'horizontal';
}

export function FieldRow({
  label,
  children,
  actions,
  direction = 'horizontal',
}: FieldRowProps) {
  if (direction === 'vertical') {
    return (
      <div className="border-b border-gray-100/80 px-3 py-2.5 last:border-b-0 dark:border-gray-700/80">
        <div className="mb-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-400">
          {label}
        </div>
        <div className="min-w-0 text-[12px] text-gray-800 dark:text-gray-200">
          {children}
        </div>
        {actions && (
          <div className="mt-2 flex items-center gap-1.5">{actions}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 border-b border-gray-100/80 px-3 py-2.5 last:border-b-0 sm:flex-row sm:items-start sm:gap-3 dark:border-gray-700/80">
      <div className="text-[11px] font-medium text-gray-600 dark:text-gray-400 sm:w-20 sm:flex-none sm:pt-0.5">
        {label}
      </div>
      <div className="min-w-0 flex-1 text-[12px] text-gray-800 dark:text-gray-200">
        {children}
      </div>
      {actions && (
        <div className="flex flex-col gap-1.5 sm:ml-auto sm:flex-row sm:items-center sm:gap-1.5 sm:pl-2">
          {actions}
        </div>
      )}
    </div>
  );
}
