'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  type BookmarkNode,
  addBookmark,
  addFolder,
  getTree,
  isExtensionContext,
} from '@/extension/data';
import { Download, Loader2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

async function importNodes(nodes: BookmarkNode[], parentId?: string) {
  for (const node of nodes) {
    if (node.url) {
      await addBookmark({
        title: node.title || node.url,
        url: node.url,
        parentId,
      });
    } else {
      const folder = await addFolder({
        title: node.title || '未命名目录',
        parentId,
      });
      if (node.children?.length) {
        await importNodes(node.children, folder.id);
      }
    }
  }
}

export function ImportExportSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleExport() {
    try {
      setExporting(true);
      const tree = await getTree();
      const blob = new Blob([JSON.stringify(tree, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      a.href = url;
      a.download = `onenav-bookmarks-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('书签导出完成，已保存为 JSON 文件');
    } catch (error) {
      console.error(error);
      toast.error('导出失败，请稍后重试');
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as BookmarkNode[];
      if (!Array.isArray(payload) || payload.length === 0) {
        toast.error('文件内容格式不正确');
        return;
      }
      const tree = await getTree();
      const rootId = tree?.[0]?.id;
      if (!rootId) {
        toast.error('无法定位书签根目录');
        return;
      }
      await importNodes(payload, rootId);
      toast.success('导入完成，书签已合并至根目录');
    } catch (error) {
      console.error(error);
      toast.error('导入失败，请确认文件为 OneNav 导出的 JSON');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">导出书签</h2>
          <p className="text-xs text-muted-foreground">
            将当前 OneNav 书签树导出为 JSON 文件，便于备份或迁移。
          </p>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white px-4 py-4 shadow-sm ring-1 ring-black/5">
          <div className="text-sm text-muted-foreground">
            点击按钮即可下载完整的书签树。
            {!isExtensionContext() && (
              <span className="ml-2">
                （当前为预览模式，导出数据来自内置示例树）
              </span>
            )}
          </div>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 正在导出...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" /> 导出 JSON
              </span>
            )}
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">导入书签</h2>
          <p className="text-xs text-muted-foreground">
            选择 OneNav 导出的 JSON 文件，将内容合并至当前书签根目录下。
          </p>
        </div>
        <div className="space-y-4 rounded-lg bg-white px-4 py-4 shadow-sm ring-1 ring-black/5">
          <div className="space-y-2">
            <Label htmlFor="bookmark-import" className="text-sm font-medium">
              选择文件
            </Label>
            <Input
              id="bookmark-import"
              type="file"
              accept="application/json"
              ref={fileInputRef}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImport(file);
                event.target.value = '';
              }}
              disabled={importing}
            />
            <p className="text-xs text-muted-foreground">
              建议使用 OneNav 导出的 JSON
              文件，导入将保留层级结构并在根目录下创建。
            </p>
          </div>
          <div className="flex items-center justify-end">
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> 正在导入...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" /> 重新选择文件
                </span>
              )}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-lg bg-white px-4 py-4 text-xs text-muted-foreground shadow-sm ring-1 ring-primary/10">
        <h3 className="text-sm font-medium text-primary">提示</h3>
        <ScrollArea className="max-h-32 pr-4">
          <ul className="list-disc space-y-2 pl-4">
            <li>导入操作会在当前根目录末尾追加新内容，不会覆盖现有书签。</li>
            <li>如果导入文件包含重复链接，可以在弹出层中使用搜索快速去重。</li>
            <li>
              如需使用浏览器原生书签，请先在 Chrome 中导出，再手动转换为 OneNav
              支持的 JSON 结构。
            </li>
          </ul>
        </ScrollArea>
      </section>
    </div>
  );
}
