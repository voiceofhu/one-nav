'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDrawer } from './ConfirmDrawer';

export function BookmarkDetail({
  id,
  onMutate,
}: {
  id: string;
  onMutate?: () => void;
}) {
  const [node, setNode] = useState<BookmarkNode | null>(null);
  const [accounts, setAccounts] = useState<AccountCredential[]>([]);
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    (async () => {
      const n = await getNode(id);
      setNode(n || null);
      const meta = await getBookmarkMeta(id);
      setAccounts(meta?.accounts || []);
      setEditing(false);
    })();
  }, [id]);

  const [openConfirm, setOpenConfirm] = useState(false);

  if (!node)
    return <div className="text-sm text-muted-foreground">未找到书签</div>;

  async function saveTitle() {
    if (!node) return;
    await updateBookmark(node.id, { title: node.title });
    onMutate?.();
  }

  async function handleDelete() {
    if (!node) return;
    setOpenConfirm(true);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-muted-foreground mb-1">标题</div>
        <Input
          value={node.title || ''}
          onChange={(e) =>
            setNode({ ...(node as BookmarkNode), title: e.target.value })
          }
        />
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-1">链接</div>
        <a
          className="text-sm underline break-all"
          href={node.url}
          target="_blank"
          rel="noreferrer"
        >
          {node.url}
        </a>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={saveTitle}>
          保存
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(node.url, '_blank')?.focus()}
        >
          打开
        </Button>
        <Button size="sm" variant="destructive" onClick={handleDelete}>
          删除
        </Button>
      </div>
      <ConfirmDrawer
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="确认删除书签"
        description={
          <span>
            将永久删除“<strong>{node.title || node.url}</strong>
            ”。此操作不可撤销。
          </span>
        }
        onConfirm={async () => {
          if (!node) return;
          await removeBookmark(node.id);
          onMutate?.();
          const sp = new URLSearchParams(params.toString());
          sp.delete('id');
          router.replace(`${pathname}?${sp.toString()}`);
        }}
      />

      <Separator className="my-2" />

      <div className="flex items-center justify-between">
        <div className="font-medium text-sm">账号与安全</div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? '完成' : '编辑'}
          </Button>
          {editing && (
            <Button
              size="sm"
              onClick={async () => {
                await setBookmarkMeta(id, { accounts });
                toast.success('已保存账号');
                setEditing(false);
              }}
            >
              保存账号
            </Button>
          )}
        </div>
      </div>

      {!editing ? (
        <div className="space-y-3">
          {accounts.length === 0 ? (
            <div className="text-xs text-muted-foreground">暂无账号信息</div>
          ) : (
            accounts.map((acc, i) => (
              <AccountCard
                key={i}
                account={acc}
                title={node.title || ''}
                url={node.url || ''}
                updatedAt={node.dateGroupModified || node.dateAdded}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  placeholder="账号/用户名"
                  value={acc.username}
                  onChange={(e) =>
                    setAccounts((arr) =>
                      arr.map((a, idx) =>
                        idx === i ? { ...a, username: e.target.value } : a,
                      ),
                    )
                  }
                />
                <Input
                  placeholder="密码"
                  type="text"
                  value={acc.password}
                  onChange={(e) =>
                    setAccounts((arr) =>
                      arr.map((a, idx) =>
                        idx === i ? { ...a, password: e.target.value } : a,
                      ),
                    )
                  }
                />
              </div>
              <Input
                placeholder="otpauth:// 或密钥"
                value={acc.totp || ''}
                onChange={(e) =>
                  setAccounts((arr) =>
                    arr.map((a, idx) =>
                      idx === i ? { ...a, totp: e.target.value } : a,
                    ),
                  )
                }
              />
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setAccounts((arr) => arr.filter((_, idx) => idx !== i))
                  }
                >
                  删除此账号
                </Button>
              </div>
            </div>
          ))}
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setAccounts((arr) => [
                  ...arr,
                  { username: '', password: '', totp: '' },
                ])
              }
            >
              + 添加账号
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountCard({
  account,
  title,
  url,
  updatedAt,
}: {
  account: AccountCredential;
  title: string;
  url: string;
  updatedAt?: number;
}) {
  const initials = useMemo(
    () => (title?.trim()?.[0] || 'B').toUpperCase(),
    [title],
  );
  const host = useMemo(() => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }, [url]);

  const { code, progress } = useTotp(account.totp);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}已复制`);
    } catch {
      toast.error('复制失败');
    }
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground p-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold select-none">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{title || host}</div>
          {updatedAt && (
            <div className="text-xs text-muted-foreground">
              上次修改时间：{formatDate(updatedAt)}
            </div>
          )}
        </div>
      </div>
      <Separator className="my-3" />
      <div className="space-y-2 text-sm">
        <Row label="用户名">
          <button
            className="truncate hover:underline"
            title="点击复制用户名"
            onClick={() => copy(account.username, '用户名')}
          >
            {account.username || '—'}
          </button>
        </Row>
        <Row label="密码">
          <button
            className="group font-mono"
            title="点击复制密码"
            onClick={() => copy(account.password, '密码')}
          >
            <span className="group-hover:hidden select-none">
              {maskPassword(account.password)}
            </span>
            <span className="hidden group-hover:inline">
              {account.password || '—'}
            </span>
          </button>
        </Row>
        <Row label="验证码">
          {account.totp ? (
            <div className="flex items-center gap-2 font-mono">
              <TotpRing progress={progress} />
              <span className="tracking-widest select-none">
                {code.slice(0, 3)} {code.slice(3)}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">未配置</span>
          )}
        </Row>
        <Row label="网站">
          <span className="truncate">{host}</span>
        </Row>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 items-center">
      <div className="col-span-1 text-xs text-muted-foreground">{label}</div>
      <div className="col-span-3 min-w-0">{children}</div>
    </div>
  );
}

function maskPassword(pwd: string) {
  if (!pwd) return '—';
  const len = Math.max(8, Math.min(16, pwd.length));
  return '•'.repeat(len);
}

function formatDate(ts: number) {
  try {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${y}/${m}/${day}`;
  } catch {
    return '';
  }
}

function TotpRing({ progress }: { progress: number }) {
  // progress: 0..1
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div className="relative h-4 w-4">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: '#e5e7eb' }}
      />
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
    // interval id; const is fine since we don't reassign
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
    const timer = window.setInterval(tick, 1000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
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
