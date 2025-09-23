import { useEffect, useState } from 'react';
import { useCopyToClipboard } from 'react-use';
import { toast } from 'sonner';

/**
 * 一个用于复制文本到剪贴板的自定义 hook，并提供一个临时的"已复制"状态用于 UI 反馈。
 * (为 React 19+ 优化，移除了不必要的 useCallback)
 * @param {number} [timeout=2000] - "已复制"状态持续的毫秒数。
 * @returns {{copy: (textToCopy: string) => void, isCopied: boolean, state: {value: string, error: Error}}}
 */
export function useCopy(timeout = 2000) {
  const [state, copyToClipboard] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);

  // 当复制成功或失败时，处理通知
  useEffect(() => {
    if (state.error) {
      toast.error(state.error.message || '复制失败');
      return;
    }
    if (state.value) {
      toast.success(`"${state.value}" 已复制!`);
      setIsCopied(true);

      const timer = setTimeout(() => {
        setIsCopied(false);
      }, timeout);

      // 清理函数：确保在组件卸载或下一次复制发生时清除计时器
      return () => {
        clearTimeout(timer);
      };
    }
  }, [state, timeout]);

  // 在 React 19 中，编译器会自动处理这个函数的记忆化，无需手动包装
  const copy = (textToCopy: string) => {
    copyToClipboard(textToCopy);
  };

  return {
    copy,
    state,
    isCopied,
  };
}

/**
 * 一个用于从剪贴板粘贴文本的自定义 hook
 * @returns {{paste: () => Promise<string | null>, isPasting: boolean}}
 */
export function usePaste() {
  const [isPasting, setIsPasting] = useState(false);

  const paste = async (): Promise<string | null> => {
    setIsPasting(true);
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.error('剪贴板为空');
        return null;
      }
      return text.trim();
    } catch (error) {
      console.error('Paste failed:', error);
      toast.error('读取剪贴板失败');
      return null;
    } finally {
      setIsPasting(false);
    }
  };

  return {
    paste,
    isPasting,
  };
}
