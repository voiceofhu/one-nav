import { type ClassValue, clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatToNow(d: string | number | Date) {
  return formatDistanceToNow(new Date(d), {
    addSuffix: true,
    locale: zhCN,
  });
}
