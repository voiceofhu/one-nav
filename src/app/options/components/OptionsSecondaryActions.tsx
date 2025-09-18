'use client';

import { ExternalLink, FileQuestion, FileText } from 'lucide-react';
import Link from 'next/link';

const ACTIONS = [
  {
    icon: FileText,
    label: '查看文档',
    href: 'https://onenav.h06i.com/docs',
  },
  {
    icon: ExternalLink,
    label: 'GitHub',
    href: 'https://github.com/voiceofhu/one-nav',
  },
  {
    icon: FileQuestion,
    label: '问题反馈',
    href: 'https://github.com/voiceofhu/one-nav/issues/new',
  },
];

export function OptionsSecondaryActions() {
  return (
    <nav className="flex items-center gap-4 text-sm text-muted-foreground">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Link>
        );
      })}
    </nav>
  );
}
