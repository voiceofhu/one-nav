'use client';

import clsx from 'clsx';
import type { ComponentType, SVGProps } from 'react';

export type OptionsSection =
  | 'general'
  | 'import-export'
  | 'link-health'
  | 'about';

type SidebarItem = {
  id: OptionsSection;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

type Props = {
  active: OptionsSection;
  onSelect: (section: OptionsSection) => void;
};

const ITEMS: SidebarItem[] = [
  { id: 'general', label: '基本设置' },
  { id: 'import-export', label: '导入 / 导出' },
  { id: 'link-health', label: '链接体检' },
  { id: 'about', label: '关于' },
];

export function OptionsSidebar({ active, onSelect }: Props) {
  return (
    <nav className="flex flex-col gap-1 text-sm">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={clsx(
            'rounded-md px-3 py-2 text-left transition-colors',
            active === item.id
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
