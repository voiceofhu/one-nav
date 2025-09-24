'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  type BookmarkNode,
  addBookmark,
  addFolder,
  getChildren,
  getTree,
  isExtensionContext,
} from '@/extension/data';
import {
  type AccountCredential,
  type BookmarkMetaMap,
  getAllBookmarkMetas,
  setBookmarkMeta,
} from '@/extension/storage';
import { Download, Loader2, UploadCloud } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface ParsedBookmark {
  title: string;
  url: string;
  path: string[];
  accounts: AccountCredential[];
}

interface ExportBookmarkItem {
  node: BookmarkNode;
  path: string[];
}

export function ImportExportSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const exportButtonLabel = useMemo(
    () => (exporting ? '正在导出…' : '导出 Excel'),
    [exporting],
  );

  async function handleExport() {
    try {
      setExporting(true);
      const tree = await getTree();
      const metaMap = await getAllBookmarkMetas();
      await exportWorkbook(tree, metaMap);
      toast.success('书签导出完成，已保存为 Excel 文件');
    } catch (error) {
      console.error('Export failed', error);
      toast.error('导出失败，请稍后重试');
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const parsed = await parseBookmarkFile(file);
      if (!parsed.length) {
        toast.error('未检测到可导入的书签内容');
        return;
      }

      const tree = await getTree();
      const rootId = tree?.[0]?.id;
      if (!rootId) {
        toast.error('无法定位书签根目录');
        return;
      }

      await importBookmarks(parsed, rootId);
      toast.success(`导入完成，共处理 ${parsed.length} 条书签`);
    } catch (error) {
      console.error('Import failed', error);
      toast.error(
        error instanceof Error ? error.message : '导入失败，请检查文件格式',
      );
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
            生成包含书签、账户、TOTP 的 Excel 工作簿，便于备份或分享。
          </p>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white px-4 py-4 shadow-sm ring-1 ring-black/5">
          <div className="text-sm text-muted-foreground">
            点击按钮即可下载完整的书签数据。
            {!isExtensionContext() && (
              <span className="ml-2">
                （当前为预览模式，导出数据来自内置示例树）
              </span>
            )}
          </div>
          <Button onClick={() => void handleExport()} disabled={exporting}>
            {exporting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> {exportButtonLabel}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" /> {exportButtonLabel}
              </span>
            )}
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">导入书签</h2>
          <p className="text-xs text-muted-foreground">
            支持 OneNav Excel、OneNav JSON 以及 Chrome 导出的 HTML 文件。
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
              accept=".xlsx,.xls,.json,.html,.htm,application/json,text/html,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              ref={fileInputRef}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImport(file);
                event.target.value = '';
              }}
              disabled={importing}
            />
            <p className="text-xs text-muted-foreground">
              建议优先使用 OneNav 导出的 Excel
              文件，导入将保留层级结构并自动创建账户信息。
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
            <li>Excel 工作簿包含“书签列表”“账户信息”“导出说明”三个工作表。</li>
            <li>如果导入文件包含重复链接，可在弹出层中使用搜索快速去重。</li>
            <li>Chrome HTML 导入会保留原有的目录层级，但不包含账户信息。</li>
          </ul>
        </ScrollArea>
      </section>
    </div>
  );
}

async function exportWorkbook(tree: BookmarkNode[], metaMap: BookmarkMetaMap) {
  const nodes = flattenForExport(tree);
  const XLSX = await import('xlsx');

  const bookmarkSheet = XLSX.utils.json_to_sheet(buildBookmarkRows(nodes));
  bookmarkSheet['!cols'] = [
    { wch: 28 },
    { wch: 40 },
    { wch: 60 },
    { wch: 22 },
    { wch: 22 },
  ];

  const accountSheet = XLSX.utils.json_to_sheet(
    buildAccountRows(nodes, metaMap),
  );
  accountSheet['!cols'] = [
    { wch: 28 },
    { wch: 40 },
    { wch: 60 },
    { wch: 18 },
    { wch: 28 },
    { wch: 28 },
    { wch: 40 },
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(
    buildSummaryRows(nodes, metaMap),
  );
  summarySheet['!cols'] = [{ wch: 24 }, { wch: 64 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, '导出说明');
  XLSX.utils.book_append_sheet(workbook, bookmarkSheet, '书签列表');
  XLSX.utils.book_append_sheet(workbook, accountSheet, '账户信息');

  const timestamp = buildTimestamp();
  XLSX.writeFile(workbook, `onenav-bookmarks-${timestamp}.xlsx`);
}

async function parseBookmarkFile(file: File): Promise<ParsedBookmark[]> {
  const name = file.name?.toLowerCase?.() ?? '';
  const type = file.type?.toLowerCase?.() ?? '';

  if (
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    type.includes('spreadsheet') ||
    type.includes('excel')
  ) {
    const buffer = await file.arrayBuffer();
    return parseExcelWorkbook(buffer);
  }

  if (
    name.endsWith('.html') ||
    name.endsWith('.htm') ||
    type.includes('html')
  ) {
    const text = await file.text();
    return parseChromeHtml(text);
  }

  const text = await file.text();
  return parseJsonPayload(text);
}

async function parseExcelWorkbook(
  buffer: ArrayBuffer,
): Promise<ParsedBookmark[]> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  if (!sheetNames?.length) {
    throw new Error('Excel 文件为空或无法读取');
  }

  const bookmarkSheetName =
    sheetNames.find((name) => /书签列表|bookmarks?/i.test(name)) ||
    sheetNames[0];
  const accountSheetName = sheetNames.find((name) =>
    /账户|account/i.test(name),
  );

  const bookmarkRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[bookmarkSheetName],
    { defval: '' },
  );

  const entries = new Map<string, ParsedBookmark>();
  for (const row of bookmarkRows) {
    const url = String(row['网址'] ?? row['URL'] ?? '').trim();
    if (!url) continue;
    const title = String(row['标题'] ?? row['Title'] ?? '').trim() || url;
    const pathRaw = String(
      row['分类路径'] ?? row['路径'] ?? row['Folder Path'] ?? '',
    ).trim();
    const path = pathRaw
      ? pathRaw
          .split('/')
          .map((segment) => segment.trim())
          .filter(Boolean)
      : [];
    const key = `${path.join(' / ')}:::${title}:::${url}`;
    entries.set(key, {
      title,
      url,
      path,
      accounts: [],
    });
  }

  if (accountSheetName) {
    const accountRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      workbook.Sheets[accountSheetName],
      { defval: '' },
    );
    for (const row of accountRows) {
      const url = String(row['网址'] ?? row['URL'] ?? '').trim();
      if (!url) continue;
      const title = String(row['标题'] ?? row['Title'] ?? '').trim() || url;
      const pathRaw = String(
        row['分类路径'] ?? row['路径'] ?? row['Folder Path'] ?? '',
      ).trim();
      const path = pathRaw
        ? pathRaw
            .split('/')
            .map((segment) => segment.trim())
            .filter(Boolean)
        : [];
      const key = `${path.join(' / ')}:::${title}:::${url}`;
      const entry = entries.get(key) ?? {
        title,
        url,
        path,
        accounts: [],
      };
      const account = {
        label:
          asTrimmedString(row['账户标签'] ?? row['标签'] ?? row['Label']) || '',
        username: asTrimmedString(row['用户名'] ?? row['Username']) || '',
        password: String(row['密码'] ?? row['Password'] ?? ''),
        totp:
          asTrimmedString(row['TOTP'] ?? row['验证码'] ?? row['Two Factor']) ||
          '',
      };
      const normalised = normaliseAccount(account);
      if (normalised) {
        entry.accounts.push(normalised);
      }
      entries.set(key, entry);
    }
  }

  return Array.from(entries.values());
}

function parseJsonPayload(text: string): ParsedBookmark[] {
  try {
    const payload = JSON.parse(text) as unknown;
    if (Array.isArray(payload)) {
      return flattenJsonNodes(payload as BookmarkNode[]);
    }
    if (
      payload &&
      Array.isArray((payload as { bookmarks?: BookmarkNode[] }).bookmarks)
    ) {
      return flattenJsonNodes(
        (payload as { bookmarks: BookmarkNode[] }).bookmarks,
      );
    }
    throw new Error('不支持的 JSON 结构');
  } catch (error) {
    console.error('JSON parse error', error);
    throw new Error('JSON 文件格式不正确或已损坏');
  }
}

function parseChromeHtml(html: string): ParsedBookmark[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const root = doc.querySelector('dl');
  if (!root) {
    throw new Error('未检测到 Chrome 导出的 HTML 结构');
  }
  const results: ParsedBookmark[] = [];
  walkChromeDom(root, [], results);
  return results;
}

async function importBookmarks(bookmarks: ParsedBookmark[], rootId: string) {
  const folderCache = new Map<string, string>();
  const childrenCache = new Map<string, BookmarkNode[]>();

  const ensureFolder = async (segments: string[]) => {
    let parentId = rootId;
    for (const raw of segments) {
      const name = raw.trim();
      if (!name) continue;
      const cacheKey = `${parentId}::${name}`;
      const cached = folderCache.get(cacheKey);
      if (cached) {
        parentId = cached;
        continue;
      }

      let children = childrenCache.get(parentId);
      if (!children) {
        children = await getChildren(parentId);
        childrenCache.set(parentId, children);
      }

      let folder = children.find(
        (child) => !child.url && (child.title?.trim() || '') === name,
      );
      if (!folder) {
        folder = await addFolder({ title: name, parentId });
        children = [...children, folder];
        childrenCache.set(parentId, children);
      }

      folderCache.set(cacheKey, folder.id);
      parentId = folder.id;
    }
    return parentId;
  };

  for (const item of bookmarks) {
    const parentId = await ensureFolder(item.path);
    const safeTitle = item.title?.trim() || item.url;
    const created = await addBookmark({
      title: safeTitle,
      url: item.url,
      parentId,
    });

    const accounts = item.accounts
      .map(normaliseAccount)
      .filter((acc): acc is AccountCredential => Boolean(acc));
    if (accounts.length) {
      await setBookmarkMeta(created.id, { accounts });
    }
  }
}

function flattenForExport(tree: BookmarkNode[]): ExportBookmarkItem[] {
  const root = tree?.[0];
  if (!root) return [];
  return walkTree(root.children ?? [], []);
}

function walkTree(nodes: BookmarkNode[], path: string[]): ExportBookmarkItem[] {
  const output: ExportBookmarkItem[] = [];
  for (const node of nodes) {
    if (!node) continue;
    const title = (node.title || '').trim();
    if (node.url) {
      output.push({
        node,
        path,
      });
    } else {
      const nextPath = title ? [...path, title] : path;
      output.push(...walkTree(node.children ?? [], nextPath));
    }
  }
  return output;
}

function buildBookmarkRows(items: ExportBookmarkItem[]) {
  return items.map(({ node, path }) => ({
    分类路径: path.join(' / ') || '（根目录）',
    标题: (node.title || '').trim() || node.url || '未命名书签',
    网址: node.url || '',
    创建时间: formatTimestamp(node.dateAdded),
    修改时间: formatTimestamp(node.dateGroupModified),
  }));
}

function buildAccountRows(
  items: ExportBookmarkItem[],
  metaMap: BookmarkMetaMap,
) {
  const rows: Array<Record<string, string>> = [];
  for (const { node, path } of items) {
    const meta = metaMap[node.id];
    if (!meta?.accounts?.length) continue;
    for (const account of meta.accounts) {
      rows.push({
        分类路径: path.join(' / ') || '（根目录）',
        标题: (node.title || '').trim() || node.url || '未命名书签',
        网址: node.url || '',
        账户标签: account.label || '',
        用户名: account.username || '',
        密码: account.password || '',
        TOTP: account.totp || '',
      });
    }
  }
  return rows.length ? rows : [{ 提示: '当前没有账户信息' }];
}

function buildSummaryRows(
  items: ExportBookmarkItem[],
  metaMap: BookmarkMetaMap,
): string[][] {
  const totalBookmarks = items.length;
  let accountCount = 0;
  let totpCount = 0;
  for (const { node } of items) {
    const accounts = metaMap[node.id]?.accounts || [];
    accountCount += accounts.length;
    totpCount += accounts.filter((acc) => acc.totp?.trim()).length;
  }

  return [
    ['OneNav 导出时间', new Date().toLocaleString()],
    ['书签总数', String(totalBookmarks)],
    ['账户总数', String(accountCount)],
    ['包含 TOTP 的账户', String(totpCount)],
    ['说明', '本工作簿包含书签结构与所有附加账户信息，请妥善保管。'],
  ];
}

function formatTimestamp(value?: number) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '';
  }
}

function buildTimestamp() {
  const now = new Date();
  const pad = (input: number) => String(input).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

function asTrimmedString(value: unknown) {
  const str = String(value ?? '').trim();
  return str ? str : undefined;
}

function normaliseAccount(
  input: Partial<AccountCredential>,
): AccountCredential | null {
  const username = input.username?.trim?.() || '';
  const password = input.password || '';
  const totp = input.totp?.trim?.();
  const label = input.label?.trim?.();
  if (!username && !password && !totp && !label) return null;
  return {
    username,
    password,
    totp: totp || undefined,
    label: label || undefined,
  };
}

function flattenJsonNodes(nodes: BookmarkNode[]): ParsedBookmark[] {
  const output: ParsedBookmark[] = [];
  const root = { children: nodes } as BookmarkNode;
  const flattened = flattenForExport([root]);
  for (const item of flattened) {
    output.push({
      title: (item.node.title || '').trim() || item.node.url || '未命名书签',
      url: item.node.url || '',
      path: item.path,
      accounts: [],
    });
  }
  return output;
}

function walkChromeDom(
  element: Element,
  path: string[],
  out: ParsedBookmark[],
) {
  for (const child of Array.from(element.children)) {
    if (child.tagName !== 'DT') continue;
    const first = child.firstElementChild;
    if (!first) continue;
    if (first.tagName === 'H3') {
      const folderName = first.textContent?.trim() || '未命名目录';
      const next = child.nextElementSibling;
      if (next && next.tagName === 'DL') {
        walkChromeDom(next, [...path, folderName], out);
      }
    } else if (first.tagName === 'A') {
      const anchor = first as HTMLAnchorElement;
      const href = anchor.getAttribute('HREF') || anchor.href || '';
      if (!href) continue;
      const title = anchor.textContent?.trim() || href;
      out.push({
        title,
        url: href,
        path: [...path],
        accounts: [],
      });
    }
  }
}
