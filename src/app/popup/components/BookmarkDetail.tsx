'use client';

/* eslint-disable @next/next/no-img-element */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type BookmarkNode,
  getNode,
  removeBookmark,
  updateBookmark,
} from '@/extension/data';
import {
  type AccountCredential,
  getBookmarkMeta,
  setBookmarkMeta,
} from '@/extension/storage';
import clsx from 'clsx';
import {
  Copy,
  Eye,
  EyeOff,
  Globe2,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';

import { usePopupState } from '../state/popup-state';
import { ConfirmDrawer } from './ConfirmDrawer';

export function BookmarkDetail({
  id,
  onMutate,
  onClose,
}: {
  id: string;
  onMutate?: () => void;
  onClose?: () => void;
}) {
  const [node, setNode] = useState<BookmarkNode | null>(null);
  const [accounts, setAccounts] = useState<AccountCredential[]>([]);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftUrl, setDraftUrl] = useState('');
  const [draftAccounts, setDraftAccounts] = useState<AccountCredential[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const { closeDetail } = usePopupState();

  const refresh = useCallback(async () => {
    const [n, meta] = await Promise.all([getNode(id), getBookmarkMeta(id)]);
    setNode(n || null);
    setAccounts(meta?.accounts || []);
  }, [id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [n, meta] = await Promise.all([getNode(id), getBookmarkMeta(id)]);
        if (!active) return;
        setNode(n || null);
        setAccounts(meta?.accounts || []);
        setEditing(false);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const normalizedAccounts = editing ? draftAccounts : accounts;
  const primaryAccount = accounts[0];
  const updatedAt = node?.dateGroupModified || node?.dateAdded;
  const host = useMemo(() => getHost(node?.url), [node?.url]);

  const startEditing = useCallback(() => {
    if (!node) return;
    setDraftTitle(node.title || '');
    setDraftUrl(node.url || '');
    const next =
      accounts.length > 0
        ? accounts.map((acc) => ({ ...acc }))
        : [{ username: '', password: '', totp: '' }];
    setDraftAccounts(next);
    setEditing(true);
  }, [accounts, node]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    setDraftTitle('');
    setDraftUrl('');
    setDraftAccounts([]);
  }, []);

  const updateDraftAccount = useCallback(
    (index: number, patch: Partial<AccountCredential>) => {
      setDraftAccounts((prev) =>
        prev.map((acc, i) => (i === index ? { ...acc, ...patch } : acc)),
      );
    },
    [],
  );

  const removeDraftAccount = useCallback((index: number) => {
    setDraftAccounts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addDraftAccount = useCallback(() => {
    setDraftAccounts((prev) => [
      ...prev,
      { username: '', password: '', totp: '' },
    ]);
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (!node) return;
    setSaving(true);
    try {
      const trimmedTitle = draftTitle.trim();
      const safeTitle = trimmedTitle || node.url || '书签';
      const trimmedUrl = draftUrl.trim();
      await updateBookmark(node.id, {
        title: safeTitle,
        url: trimmedUrl || node.url || '',
      });

      const cleaned = draftAccounts
        .map((acc) => ({
          username: acc.username?.trim() || '',
          password: acc.password || '',
          totp: acc.totp?.trim() || '',
          label: acc.label?.trim() || undefined,
        }))
        .filter((acc) => acc.username || acc.password || acc.totp || acc.label);

      await setBookmarkMeta(node.id, { accounts: cleaned });
      await refresh();
      onMutate?.();
      toast.success('已保存');
      cancelEditing();
    } catch (err) {
      console.error(err);
      toast.error('保存失败，请稍后再试');
    } finally {
      setSaving(false);
    }
  }, [
    cancelEditing,
    draftAccounts,
    draftTitle,
    draftUrl,
    node,
    onMutate,
    refresh,
  ]);

  const handleDelete = useCallback(() => {
    if (!node) return;
    setOpenConfirm(true);
  }, [node]);

  if (!node) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {loading ? '加载中...' : '未找到书签'}
      </div>
    );
  }

  const detailTitle = node.title?.trim() || host || '未命名书签';
  const disableSave = saving;
  const sectionCardClass =
    'rounded-3xl border border-border/40 bg-card/85 px-5 py-5 shadow-sm sm:px-6 sm:py-6';

  return (
    <div className="mx-auto flex h-full w-full min-w-0 max-w-none flex-col gap-5 pb-10 text-[13px] leading-snug text-foreground">
      <div className="sticky top-0 z-10 bg-background pb-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/40 bg-card/90 px-4 py-3 shadow-sm">
          {editing ? (
            <>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg px-3 text-red-500 hover:text-red-600"
                  onClick={handleDelete}
                >
                  删除
                </Button>
              </div>
              <div className="min-w-0 flex-1 truncate text-center text-[12px] text-muted-foreground">
                {(draftTitle || '').trim() || detailTitle}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg px-3"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  className="h-8 rounded-lg px-4 shadow-sm"
                  onClick={handleSaveAll}
                  disabled={disableSave}
                >
                  {saving ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  完成
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
                {detailTitle}
              </div>
              <div className="flex items-center gap-1.5">
                {onClose ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg px-3 text-muted-foreground transition hover:text-foreground"
                    onClick={onClose}
                  >
                    隐藏
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  className="h-8 rounded-lg px-4 shadow-sm"
                  onClick={startEditing}
                >
                  编辑
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={sectionCardClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <BookmarkAvatar url={node.url} title={detailTitle} size={48} />
          <div className="min-w-0 flex-1 space-y-3">
            {editing ? (
              <>
                <Input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="输入名称"
                  className="h-10 rounded-lg border-none bg-muted/40 px-3 text-[14px] font-semibold focus-visible:ring-1"
                />
                <Textarea
                  value={draftUrl}
                  onChange={(e) => setDraftUrl(e.target.value)}
                  placeholder="输入链接"
                  rows={2}
                  className="resize-none rounded-lg border-none bg-muted/40 px-3 py-2 text-[13px] focus-visible:ring-1"
                />
              </>
            ) : (
              <div className="space-y-2">
                <div className="truncate text-[15px] font-semibold text-foreground">
                  {detailTitle}
                </div>
                {node.url ? (
                  <div className="space-y-2">
                    <a
                      href={node.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all rounded-lg bg-muted/25 px-3 py-2 text-[12px] font-medium text-foreground/80 transition hover:bg-muted/50"
                    >
                      {node.url}
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-fit rounded-lg px-3 text-[12px]"
                      onClick={() =>
                        node.url &&
                        window.open(node.url, '_blank', 'noreferrer')
                      }
                    >
                      <Globe2 className="mr-1.5 h-3.5 w-3.5" />
                      打开链接
                    </Button>
                  </div>
                ) : (
                  <div className="text-[12px] text-muted-foreground">
                    暂无链接
                  </div>
                )}
              </div>
            )}
            <div className="text-[11px] text-muted-foreground">
              上次修改时间：{formatDate(updatedAt)} · {host || '未知站点'}
            </div>
          </div>
        </div>
      </div>

      <div className={sectionCardClass}>
        <div className="mb-4 flex items-center justify-between text-[12px] font-medium text-muted-foreground">
          <span>账号信息</span>
          {!editing && normalizedAccounts.length > 0 ? (
            <span className="text-[11px] font-normal text-muted-foreground/80">
              共 {normalizedAccounts.length} 个账号
            </span>
          ) : null}
        </div>
        {!editing ? (
          <div className="space-y-3">
            {normalizedAccounts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/50 bg-muted/15 px-4 py-6 text-center text-[12px] text-muted-foreground">
                暂未保存账号信息
              </div>
            ) : (
              normalizedAccounts.map((acc, index) => (
                <AccountCard
                  key={`${acc.username}-${index}`}
                  account={acc}
                  title={detailTitle}
                  url={node.url || ''}
                  host={host}
                  updatedAt={updatedAt}
                />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {draftAccounts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/50 bg-muted/15 px-4 py-6 text-center text-[12px] text-muted-foreground">
                暂无账号，请点击下方按钮添加
              </div>
            ) : (
              draftAccounts.map((acc, index) => (
                <EditableAccountCard
                  key={index}
                  index={index}
                  account={acc}
                  host={host}
                  onChange={updateDraftAccount}
                  onRemove={removeDraftAccount}
                />
              ))
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl border-dashed border-border/50 py-4 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground"
              onClick={addDraftAccount}
            >
              + 添加账号
            </Button>
          </div>
        )}
      </div>

      {!editing && primaryAccount ? (
        <SecurityCard account={primaryAccount} />
      ) : null}

      <ConfirmDrawer
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="确认删除书签"
        description={
          <span>
            将长期删除“<strong>{detailTitle}</strong>”。此操作不可撤销。
          </span>
        }
        onConfirm={async () => {
          await removeBookmark(node.id);
          onMutate?.();
          closeDetail();
        }}
      />
    </div>
  );
}

function SecurityCard({ account }: { account: AccountCredential }) {
  const status = assessSecurity(account);
  if (!status) return null;

  const tone =
    status === 'strong'
      ? {
          icon: <ShieldCheck className="h-5 w-5" />,
          title: '强密码与验证码',
          description:
            '此密码较长、不易猜到且唯一。配合验证码可在密码被盗时保护账号。',
          className:
            'rounded-3xl border border-emerald-400/60 bg-emerald-50/90 px-5 py-5 text-[12px] text-emerald-800 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100',
        }
      : status === 'medium'
        ? {
            icon: <ShieldAlert className="h-5 w-5" />,
            title: '安全性一般',
            description: '建议同时使用强密码与验证码来提升账号安全性。',
            className:
              'rounded-3xl border border-amber-300/60 bg-amber-50/90 px-5 py-5 text-[12px] text-amber-800 shadow-sm dark:border-amber-300/30 dark:bg-amber-500/10 dark:text-amber-100',
          }
        : {
            icon: <ShieldX className="h-5 w-5" />,
            title: '安全性较弱',
            description: '尚未配置强密码或验证码，请尽快完善账号安全设置。',
            className:
              'rounded-3xl border border-rose-300/60 bg-rose-50/90 px-5 py-5 text-[12px] text-rose-800 shadow-sm dark:border-rose-300/30 dark:bg-rose-500/10 dark:text-rose-100',
          };

  return (
    <div className={tone.className}>
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5">{tone.icon}</div>
        <div>
          <div className="text-[13px] font-semibold">{tone.title}</div>
          <p className="mt-0.5 text-[12px] leading-relaxed text-current/80">
            {tone.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function assessSecurity(
  account: AccountCredential,
): 'strong' | 'medium' | 'weak' | null {
  const pwd = account.password?.trim() ?? '';
  const hasPassword = pwd.length > 0;
  const hasStrongPassword =
    hasPassword &&
    pwd.length >= 12 &&
    /[0-9]/.test(pwd) &&
    /[A-Za-z]/.test(pwd);
  const hasTotp = Boolean(account.totp?.trim());
  if (!hasPassword && !hasTotp) return null;
  if (hasStrongPassword && hasTotp) return 'strong';
  if (hasStrongPassword || hasTotp) return 'medium';
  return 'weak';
}

function AccountCard({
  account,
  title,
  url,
  host,
  updatedAt,
}: {
  account: AccountCredential;
  title: string;
  url: string;
  host: string;
  updatedAt?: number;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const { code, progress } = useTotp(account.totp);

  async function copy(text: string, label: string) {
    if (!text) {
      toast.error(`${label}为空`);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}已复制`);
    } catch {
      toast.error('复制失败');
    }
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-background/80 px-4 py-4 shadow-sm sm:px-5 sm:py-5">
      <div className="flex items-start gap-2.5">
        <BookmarkAvatar url={url} title={title} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-[13px]">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-foreground">
                {account.label || title || host}
              </div>
              {updatedAt && (
                <div className="text-[11px] text-muted-foreground">
                  上次修改时间：{formatDate(updatedAt)}
                </div>
              )}
            </div>
            {url ? (
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-lg px-2 text-[12px]"
                onClick={() => window.open(url, '_blank', 'noreferrer')}
              >
                打开
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <FieldSection>
          <FieldRow
            label="用户名"
            actions={
              account.username ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                  onClick={() => copy(account.username, '用户名')}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              ) : undefined
            }
          >
            <span className="truncate">{account.username || '—'}</span>
          </FieldRow>

          <FieldRow
            label="密码"
            actions={
              account.password ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                    title={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => copy(account.password, '密码')}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : undefined
            }
          >
            <span className="font-mono text-[13px]">
              {showPassword
                ? account.password || '—'
                : maskPassword(account.password)}
            </span>
          </FieldRow>

          <FieldRow
            label="验证码"
            actions={
              account.totp ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                  onClick={() => copy(code, '验证码')}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              ) : undefined
            }
          >
            {account.totp ? (
              <div className="flex items-center gap-1.5 font-mono text-[13px]">
                <TotpRing progress={progress} />
                <span className="tracking-widest select-none">
                  {code.slice(0, 3)} {code.slice(3)}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">未配置</span>
            )}
          </FieldRow>

          <FieldRow
            label="网站"
            actions={
              host ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={() => copy(host, '网站')}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              ) : undefined
            }
          >
            <span className="truncate">{host || '—'}</span>
          </FieldRow>
        </FieldSection>
      </div>
    </div>
  );
}

function EditableAccountCard({
  index,
  account,
  host,
  onChange,
  onRemove,
}: {
  index: number;
  account: AccountCredential;
  host: string;
  onChange: (index: number, patch: Partial<AccountCredential>) => void;
  onRemove: (index: number) => void;
}) {
  async function handleCopy(value: string, label: string) {
    if (!value) {
      toast.error(`${label}为空`);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label}已复制`);
    } catch {
      toast.error('复制失败');
    }
  }

  async function pasteTotp() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.error('剪贴板为空');
        return;
      }
      onChange(index, { totp: text.trim() });
      toast.success('已粘贴验证码');
    } catch {
      toast.error('读取剪贴板失败');
    }
  }

  return (
    <div className="space-y-4 rounded-2xl bg-muted/15 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-center justify-between text-[13px] font-semibold text-foreground">
        <span>账号 {index + 1}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-lg px-2 text-muted-foreground hover:text-red-500"
          onClick={() => onRemove(index)}
        >
          删除账号
        </Button>
      </div>
      <FieldSection variant="plain">
        <FieldRow label="显示名称">
          <Input
            value={account.label || ''}
            placeholder="可选：例如主账号"
            onChange={(e) => onChange(index, { label: e.target.value })}
            className="h-8 rounded-lg border-none bg-muted/40 px-3 text-[13px] focus-visible:ring-1"
          />
        </FieldRow>
        <FieldRow label="用户名">
          <Input
            value={account.username}
            placeholder="guaguadm@gmail.com"
            onChange={(e) => onChange(index, { username: e.target.value })}
            className="h-8 rounded-lg border-none bg-muted/40 px-3 text-[13px] focus-visible:ring-1"
          />
        </FieldRow>
        <FieldRow label="密码">
          <Input
            type="text"
            value={account.password}
            placeholder="填写密码"
            onChange={(e) => onChange(index, { password: e.target.value })}
            className="h-8 rounded-lg border-none bg-muted/40 px-3 text-[13px] focus-visible:ring-1"
          />
        </FieldRow>
        <FieldRow
          label="验证码"
          actions={
            account.totp ? (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-lg px-2"
                  onClick={() => onChange(index, { totp: '' })}
                >
                  删除验证码
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-lg px-2"
                  onClick={() => handleCopy(account.totp || '', '验证码设置')}
                >
                  拷贝设置 URL
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-lg px-2"
                onClick={pasteTotp}
              >
                粘贴验证码
              </Button>
            )
          }
        >
          <Textarea
            value={account.totp || ''}
            placeholder="otpauth:// 或密钥"
            rows={2}
            onChange={(e) => onChange(index, { totp: e.target.value })}
            className="min-h-[60px] rounded-lg border-none bg-muted/40 px-3 text-[13px] focus-visible:ring-1"
          />
        </FieldRow>
        <FieldRow label="网站">
          <div className="flex items-center justify-between gap-3 text-[13px] text-muted-foreground">
            <span className="truncate">{host || '—'}</span>
            {host ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-lg px-2 text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(host, '网站')}
              >
                复制
              </Button>
            ) : null}
          </div>
        </FieldRow>
      </FieldSection>
    </div>
  );
}

function FieldSection({
  children,
  variant = 'card',
  className,
}: {
  children: ReactNode;
  variant?: 'card' | 'plain';
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-xl',
        variant === 'card'
          ? 'border border-border/50 bg-muted/10'
          : 'bg-transparent',
        className,
      )}
    >
      {children}
    </div>
  );
}

function FieldRow({
  label,
  children,
  actions,
}: {
  label: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border/35 px-3 py-2.5 last:border-b-0 sm:flex-row sm:items-start sm:gap-4">
      <div className="text-[11px] font-medium text-muted-foreground sm:w-24 sm:flex-none sm:pt-0.5">
        {label}
      </div>
      <div className="min-w-0 flex-1 text-[13px]">{children}</div>
      {actions ? (
        <div className="flex flex-col gap-1.5 sm:ml-auto sm:flex-row sm:items-center sm:gap-1.5 sm:pl-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

function BookmarkAvatar({
  url,
  title,
  size = 48,
}: {
  url?: string | null;
  title?: string | null;
  size?: number;
}) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const candidates = useMemo(() => getFaviconCandidates(url), [url]);
  const src = candidates[candidateIndex];
  const initials = (title?.trim()?.[0] || 'B').toUpperCase();

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(false);
  }, [url]);

  if (!src || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-2xl bg-muted/40 text-base font-semibold text-muted-foreground"
        style={{ height: size, width: size }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="favicon"
      className="shrink-0 rounded-2xl border border-border/60 bg-background object-cover"
      style={{ height: size, width: size }}
      onError={() => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((prev) => prev + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

function getFaviconCandidates(url?: string | null): string[] {
  if (!url) return [];
  try {
    const u = new URL(url);
    const domainUrl = `${u.protocol}//${u.hostname}`;
    return [
      `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(domainUrl)}`,
      `${domainUrl}/favicon.ico`,
    ];
  } catch {
    return [];
  }
}

function getHost(url?: string | null) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function maskPassword(pwd: string) {
  if (!pwd) return '—';
  const len = Math.max(8, Math.min(16, pwd.length));
  return '•'.repeat(len);
}

function formatDate(ts?: number) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleDateString();
  } catch {
    return '—';
  }
}

function TotpRing({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div className="relative h-4 w-4">
      <div className="absolute inset-0 rounded-full bg-muted" />
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(#22c55e ${pct}%, transparent 0)` }}
      />
      <div className="absolute inset-0 m-[2px] rounded-full bg-background" />
    </div>
  );
}

function useTotp(input?: string) {
  const [code, setCode] = useState('000000');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function tick() {
      const { secret, period, digits } = parseTotp(input);
      if (!secret) {
        setCode('000000');
        setProgress(0);
        return;
      }
      const now = Math.floor(Date.now() / 1000);
      const counter = Math.floor(now / period);
      const remain = period - (now % period);
      const c = await generateTotp(secret, counter, digits);
      if (!mounted) return;
      setCode(c);
      setProgress((period - remain) / period);
    }
    tick();
    const timer = setInterval(tick, 1000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [input]);

  return { code, progress };
}

function parseTotp(input?: string): {
  secret: string | null;
  period: number;
  digits: number;
} {
  if (!input) return { secret: null, period: 30, digits: 6 };
  if (input.startsWith('otpauth://')) {
    try {
      const u = new URL(input);
      const secret = (u.searchParams.get('secret') || '').replace(/\s+/g, '');
      const period = Number(u.searchParams.get('period') || '30');
      const digits = Number(u.searchParams.get('digits') || '6');
      return {
        secret,
        period: isFinite(period) && period > 0 ? period : 30,
        digits: digits === 8 ? 8 : 6,
      };
    } catch {
      return { secret: input, period: 30, digits: 6 };
    }
  }
  return { secret: input, period: 30, digits: 6 };
}

async function generateTotp(
  secretBase32: string,
  counter: number,
  digits: number,
): Promise<string> {
  const key = base32ToBytes(secretBase32.toUpperCase());
  const counterBytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const hmac = new Uint8Array(
    await crypto.subtle.sign('HMAC', cryptoKey, counterBytes),
  );
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  const otp = (bin % 10 ** digits).toString().padStart(digits, '0');
  return otp;
}

function base32ToBytes(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = base32.replace(/=+$/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const idx = alphabet.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}
