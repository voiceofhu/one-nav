'use client';

import { flattenBookmarks } from '@/app/popup/lib/bookmark-utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type BookmarkNode, getTree, removeBookmark } from '@/extension/data';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type BookmarkHealthStatus =
  | 'ok'
  | 'invalid'
  | 'error'
  | 'unknown'
  | 'skipped'
  | 'removed';

type BookmarkHealthResult = {
  id: string;
  title: string;
  url: string;
  status: BookmarkHealthStatus;
  httpStatus?: number;
  note?: string;
};

type ScanState = {
  status: 'idle' | 'running' | 'completed' | 'cancelled';
  total: number;
  processed: number;
};

const CONCURRENCY = 6;

export function LinkHealthSection() {
  const [scanState, setScanState] = useState<ScanState>({
    status: 'idle',
    total: 0,
    processed: 0,
  });
  const [results, setResults] = useState<
    Array<BookmarkHealthResult | undefined>
  >([]);
  const [removing, setRemoving] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const summary = useMemo(() => {
    const counts: Record<BookmarkHealthStatus, number> = {
      ok: 0,
      invalid: 0,
      error: 0,
      unknown: 0,
      skipped: 0,
      removed: 0,
    };
    for (const item of results) {
      if (!item) continue;
      counts[item.status] += 1;
    }
    return counts;
  }, [results]);

  const invalidCandidates = useMemo(
    () =>
      results.filter((item): item is BookmarkHealthResult =>
        item ? item.status === 'invalid' || item.status === 'error' : false,
      ),
    [results],
  );

  const progress = scanState.total
    ? Math.min(100, Math.round((scanState.processed / scanState.total) * 100))
    : 0;

  async function handleScan() {
    if (scanState.status === 'running') return;
    try {
      const tree = await getTree();
      const bookmarks = flattenBookmarks(tree);
      if (bookmarks.length === 0) {
        setResults([]);
        setScanState({ status: 'completed', total: 0, processed: 0 });
        toast.info('当前书签列表为空，无需检测。');
        return;
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      setResults(new Array(bookmarks.length).fill(undefined));
      setScanState({
        status: 'running',
        total: bookmarks.length,
        processed: 0,
      });

      let cursor = 0;
      const workers = Array.from(
        { length: Math.min(CONCURRENCY, bookmarks.length) },
        () =>
          (async () => {
            while (cursor < bookmarks.length) {
              if (controller.signal.aborted) return;
              const index = cursor;
              cursor += 1;
              if (index >= bookmarks.length) return;
              const node = bookmarks[index];

              let result: BookmarkHealthResult;
              try {
                result = await inspectBookmark(node, controller.signal);
              } catch (error) {
                if (controller.signal.aborted) return;
                result = {
                  id: node.id,
                  title: node.title?.trim() || node.url || '未命名书签',
                  url: node.url || '',
                  status: 'error',
                  note:
                    error instanceof Error
                      ? error.message
                      : '检测失败，请稍后重试。',
                };
              }

              if (controller.signal.aborted) return;

              setResults((prev) => {
                const next = [...prev];
                next[index] = result;
                return next;
              });
              setScanState((prev) => ({
                ...prev,
                processed: Math.min(prev.processed + 1, prev.total),
              }));
            }
          })(),
      );

      await Promise.all(workers);

      if (controller.signal.aborted) {
        setScanState((prev) => ({ ...prev, status: 'cancelled' }));
      } else {
        setScanState((prev) => ({ ...prev, status: 'completed' }));
        toast.success('链接检测完成');
      }
    } catch (error) {
      console.error(error);
      toast.error('检测过程中出现错误，请稍后再试。');
      setScanState({ status: 'idle', total: 0, processed: 0 });
      setResults([]);
    } finally {
      controllerRef.current = null;
    }
  }

  function handleCancelScan() {
    if (scanState.status !== 'running') return;
    controllerRef.current?.abort();
    setScanState((prev) => ({ ...prev, status: 'cancelled' }));
    toast.info('已取消检测，已完成的结果保留。');
  }

  async function handleBulkRemove() {
    if (removing || invalidCandidates.length === 0) return;
    const confirmed = window.confirm(
      `确定要移除 ${invalidCandidates.length} 个检测为失效的链接吗？该操作不可撤销。`,
    );
    if (!confirmed) return;

    setRemoving(true);
    const success = new Set<string>();
    const failures: string[] = [];

    try {
      for (const item of invalidCandidates) {
        try {
          await removeBookmark(item.id);
          success.add(item.id);
        } catch (error) {
          console.error(error);
          failures.push(item.title || item.url);
        }
      }

      if (success.size) {
        toast.success(`已移除 ${success.size} 个失效链接`);
        setResults((prev) =>
          prev.map((entry) => {
            if (!entry) return entry;
            if (success.has(entry.id)) {
              return {
                ...entry,
                status: 'removed',
                note: '已通过批量清理移除',
              } satisfies BookmarkHealthResult;
            }
            return entry;
          }),
        );
      }

      if (failures.length) {
        toast.error(`有 ${failures.length} 个链接移除失败`, {
          description:
            failures.length > 3
              ? `${failures.slice(0, 3).join('、')} 等`
              : failures.join('、'),
        });
      }
    } finally {
      setRemoving(false);
    }
  }

  const startButtonLabel =
    scanState.status === 'completed' || scanState.status === 'cancelled'
      ? '重新检测'
      : '开始检测';

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold">链接有效性检测</h2>
        <p className="text-xs text-muted-foreground">
          批量校验书签链接是否仍可访问，快速清理失效或失效可疑的条目。
        </p>
      </div>

      <div className="space-y-5 rounded-lg bg-white px-4 py-5 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleScan}
            disabled={scanState.status === 'running'}
          >
            {scanState.status === 'running' ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 正在检测...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" /> {startButtonLabel}
              </span>
            )}
          </Button>
          {scanState.status === 'running' && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancelScan}
              className="text-xs"
            >
              取消
            </Button>
          )}
        </div>

        {scanState.status === 'running' && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                已检测 {scanState.processed} / {scanState.total}
              </span>
              <span>请勿关闭页面，检测可能需要数十秒。</span>
            </div>
          </div>
        )}

        {scanState.status !== 'idle' && scanState.total > 0 && (
          <div className="space-y-2 rounded-md border border-muted/70 bg-muted/40 p-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> 有效 {summary.ok}
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" /> 失效 {summary.invalid}
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <ShieldAlert className="h-3.5 w-3.5" /> 请求失败 {summary.error}
              </span>
              <span className="flex items-center gap-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> 待确认{' '}
                {summary.unknown}
              </span>
              <span className="flex items-center gap-1">
                <RefreshCcw className="h-3.5 w-3.5" /> 已跳过 {summary.skipped}
              </span>
              <span className="flex items-center gap-1 text-primary">
                <Trash2 className="h-3.5 w-3.5" /> 已移除 {summary.removed}
              </span>
            </div>
            {summary.unknown > 0 && (
              <div>部分站点因跨域限制无法判断，请手动打开验证。</div>
            )}
            {summary.skipped > 0 && (
              <div>已跳过非 HTTP/HTTPS 链接或缺少 URL 的书签。</div>
            )}
          </div>
        )}

        {invalidCandidates.length > 0 && (
          <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" />
                发现 {invalidCandidates.length} 个疑似失效链接
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkRemove}
                disabled={removing || scanState.status === 'running'}
              >
                {removing ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> 正在移除
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Trash2 className="h-3.5 w-3.5" /> 批量移除
                  </span>
                )}
              </Button>
            </div>
            <ScrollArea className="max-h-64 pr-3">
              <ul className="space-y-3 text-xs">
                {invalidCandidates.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-md border border-destructive/30 bg-white/80 p-3 shadow-sm"
                  >
                    <div className="truncate font-medium text-destructive">
                      {item.title}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {item.url}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {item.httpStatus
                        ? `HTTP ${item.httpStatus}`
                        : item.note || '请求失败'}
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}

        {summary.removed > 0 && (
          <div className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
            已成功移除 {summary.removed}{' '}
            个链接。同步后在弹出层列表中将不再显示。
          </div>
        )}
      </div>
    </section>
  );
}

function isHttpUrl(url: string) {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

type CheckResult = Pick<BookmarkHealthResult, 'status' | 'httpStatus' | 'note'>;

async function inspectBookmark(node: BookmarkNode, signal: AbortSignal) {
  const url = node.url || '';
  const title = node.title?.trim() || url || '未命名书签';

  if (!url) {
    return {
      id: node.id,
      title,
      url,
      status: 'skipped',
      note: '未包含 URL，已跳过',
    } satisfies BookmarkHealthResult;
  }

  if (!isHttpUrl(url)) {
    return {
      id: node.id,
      title,
      url,
      status: 'skipped',
      note: '非 HTTP/HTTPS 链接暂不支持检测',
    } satisfies BookmarkHealthResult;
  }

  const { status, httpStatus, note } = await checkHttpUrl(url, signal);

  return {
    id: node.id,
    title,
    url,
    status,
    httpStatus,
    note,
  } satisfies BookmarkHealthResult;
}

async function checkHttpUrl(
  url: string,
  signal: AbortSignal,
): Promise<CheckResult> {
  const perform = (method: 'HEAD' | 'GET', mode: RequestMode = 'cors') =>
    fetch(url, {
      method,
      mode,
      redirect: 'follow',
      cache: 'no-store',
      signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    });

  try {
    const response = await perform('HEAD');
    if (response.type === 'opaque') {
      return {
        status: 'unknown',
        note: '目标站点未开放跨域探测，无法直接判断状态',
      };
    }
    if (response.ok) {
      return { status: 'ok', httpStatus: response.status };
    }
    if (response.status !== 405) {
      return {
        status: 'invalid',
        httpStatus: response.status,
        note: response.statusText || undefined,
      };
    }
    // 405 Method Not Allowed，继续尝试 GET
  } catch (error) {
    if (signal.aborted) throw error;
    // 继续走 GET 流程
  }

  try {
    const response = await perform('GET');
    if (response.type === 'opaque') {
      return {
        status: 'unknown',
        note: '目标站点未开放跨域探测，无法直接判断状态',
      };
    }
    if (response.ok) {
      return { status: 'ok', httpStatus: response.status };
    }
    return {
      status: 'invalid',
      httpStatus: response.status,
      note: response.statusText || undefined,
    };
  } catch (error) {
    if (signal.aborted) throw error;
    try {
      const response = await perform('GET', 'no-cors');
      if (response.type === 'opaque') {
        return {
          status: 'unknown',
          note: '链接可访问但跨域限制阻止获取状态，请手动确认。',
        };
      }
      if (response.ok) {
        return { status: 'ok', httpStatus: response.status };
      }
      return {
        status: 'invalid',
        httpStatus: response.status,
        note: response.statusText || undefined,
      };
    } catch (finalError) {
      if (signal.aborted) throw finalError;
      return {
        status: 'error',
        note:
          finalError instanceof Error
            ? finalError.message
            : '请求失败，请稍后再试。',
      };
    }
  }
}
