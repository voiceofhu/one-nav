'use client';

import { Badge } from '@/components/ui/badge';
import { ExternalLink, Globe } from 'lucide-react';

interface BookmarkInfoSectionProps {
  title: string;
  url: string;
  host: string;
  updatedAt?: number;
}

export function BookmarkInfoSection({
  title,
  url,
  host,
  updatedAt,
}: BookmarkInfoSectionProps) {
  return (
    <div className="space-y-3 w-full p-1 ">
      <div className="space-y-1 w-full">
        {/* <div className="text-sm font-medium">{title}</div> */}
        {url && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-break-spaces px-3 py-2 break-all bg-muted/60 hover:bg-muted rounded-lg">
            {/* <Globe className="h-3 w-3" /> */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              {url}
            </a>
          </div>
        )}
      </div>

      {updatedAt && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            更新于 {new Date(updatedAt).toLocaleDateString()}
          </Badge>
        </div>
      )}
    </div>
  );
}
