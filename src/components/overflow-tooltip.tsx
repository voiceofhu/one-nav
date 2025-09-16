'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useLayoutEffect, useRef, useState } from 'react';

interface OverflowTooltipCellProps {
  text: string | null | undefined;
  className?: string;
  placeholder?: string;
  tooltipText?: string | null | undefined;
}

/**
 * 一个只在文本内容溢出其容器时才显示 Tooltip 的单元格组件。
 */
export function OverflowTooltipCell({
  text,
  className,
  placeholder = 'N/A',
  tooltipText,
}: OverflowTooltipCellProps) {
  const textRef = useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // 使用 useLayoutEffect 可以在 DOM 渲染后立即同步检测，避免闪烁
  useLayoutEffect(() => {
    const element = textRef.current;
    if (element) {
      // 检查元素的实际滚动宽度是否大于其可见的客户端宽度
      if (element.scrollWidth > element.clientWidth) {
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
    }
  }, [text]); // 每当文本内容变化时重新检测

  const content = text || placeholder;
  const tooltipContent = tooltipText ?? content;

  // 如果内容溢出，则渲染带 Tooltip 的版本
  if (isOverflowing) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div ref={textRef} className={cn('truncate', className)}>
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[320px] break-all  break-words whitespace-break-spaces">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    );
  }

  // 否则，只渲染普通的 div
  return (
    <div ref={textRef} className={cn('truncate', className)}>
      {content}
    </div>
  );
}
