'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type AccountCredential } from '@/extension/storage';
import { Copy, Eye, EyeOff, Globe2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { BookmarkAvatar } from './BookmarkAvatar';
import { FieldRow, FieldSection } from './FieldComponents';
import { TotpDisplay } from './TotpDisplay';

interface AccountCardProps {
  account: AccountCredential;
  title: string;
  url: string;
  host: string;
  updatedAt?: number;
}

export function AccountCard({
  account,
  title,
  url,
  host,
  updatedAt,
}: AccountCardProps) {
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="rounded-2xl border border-gray-200/60 bg-white/90 backdrop-blur-sm px-4 py-4 shadow-lg dark:border-gray-700/60 dark:bg-gray-900/90">
      <div className="flex items-start gap-3">
        <BookmarkAvatar url={url} title={title} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                {account.label || title || host}
              </div>
              {updatedAt && (
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  {formatDate(updatedAt)}
                </div>
              )}
            </div>
            {url ? (
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-lg border-blue-200 bg-blue-50 px-2 text-[11px] text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                onClick={() => window.open(url, '_blank', 'noreferrer')}
              >
                <Globe2 className="mr-1 h-3 w-3" />
                打开
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <FieldSection>
          <FieldRow
            label="账号密码"
            direction="vertical"
            actions={
              account.username ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 rounded-md px-2 text-[10px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  onClick={() => copy(account.username, '账号密码')}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  复制
                </Button>
              ) : undefined
            }
          >
            <span className="truncate text-gray-800 dark:text-gray-200">
              {account.username || '—'}
            </span>
          </FieldRow>

          <FieldRow
            label="密码"
            direction="vertical"
            actions={
              account.password ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 rounded-md px-2 text-[10px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    onClick={() => setShowPassword((value) => !value)}
                    title={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? (
                      <EyeOff className="mr-1 h-3 w-3" />
                    ) : (
                      <Eye className="mr-1 h-3 w-3" />
                    )}
                    {showPassword ? '隐藏' : '显示'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 rounded-md px-2 text-[10px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    onClick={() => copy(account.password, '密码')}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    复制
                  </Button>
                </div>
              ) : undefined
            }
          >
            <span className="font-mono text-[11px] text-gray-800 dark:text-gray-200">
              {showPassword
                ? account.password || '—'
                : maskPassword(account.password)}
            </span>
          </FieldRow>

          <FieldRow label="验证码" direction="vertical">
            <TotpDisplay totp={account.totp} />
          </FieldRow>

          <FieldRow
            label="网站"
            direction="vertical"
            actions={
              host ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 rounded-md px-2 text-[10px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  onClick={() => copy(host, '网站')}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  复制
                </Button>
              ) : undefined
            }
          >
            <span className="truncate text-gray-800 dark:text-gray-200">
              {host || '—'}
            </span>
          </FieldRow>
        </FieldSection>
      </div>
    </div>
  );
}

interface EditableAccountCardProps {
  index: number;
  account: AccountCredential;
  host: string;
  onChange: (index: number, patch: Partial<AccountCredential>) => void;
  onRemove: (index: number) => void;
}

export function EditableAccountCard({
  index,
  account,
  host,
  onChange,
  onRemove,
}: EditableAccountCardProps) {
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
    <div className="space-y-3 rounded-2xl border border-gray-200/60 bg-gradient-to-br from-gray-50 to-gray-100/80 px-4 py-4 backdrop-blur-sm dark:border-gray-700/60 dark:from-gray-800/80 dark:to-gray-900/60">
      <div className="flex items-center justify-between text-[13px] font-semibold text-gray-900 dark:text-gray-100">
        <span>账号 {index + 1}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-lg px-2 text-[10px] text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          onClick={() => onRemove(index)}
        >
          删除
        </Button>
      </div>
      <FieldSection variant="plain">
        <FieldRow label="显示名称" direction="vertical">
          <Input
            value={account.label || ''}
            placeholder="可选：例如主账号"
            onChange={(e) => onChange(index, { label: e.target.value })}
            className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[11px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
          />
        </FieldRow>
        <FieldRow label="账号密码" direction="vertical">
          <Input
            value={account.username}
            placeholder="example@gmail.com"
            onChange={(e) => onChange(index, { username: e.target.value })}
            className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[11px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
          />
        </FieldRow>
        <FieldRow label="密码" direction="vertical">
          <Input
            type="text"
            value={account.password}
            placeholder="填写密码"
            onChange={(e) => onChange(index, { password: e.target.value })}
            className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[11px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
          />
        </FieldRow>
        <FieldRow
          label="验证码"
          direction="vertical"
          actions={
            account.totp ? (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-lg px-2 text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => onChange(index, { totp: '' })}
                >
                  删除
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-lg px-2 text-[10px] border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  onClick={() => handleCopy(account.totp || '', '验证码设置')}
                >
                  复制设置
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-lg px-2 text-[10px] border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
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
            className="min-h-[55px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
          />
        </FieldRow>
        <FieldRow
          label="网站"
          direction="vertical"
          actions={
            host ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 rounded-md px-2 text-[10px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                onClick={() => handleCopy(host, '网站')}
              >
                复制
              </Button>
            ) : null
          }
        >
          <div className="text-[11px] text-gray-600 dark:text-gray-400">
            <span className="truncate">{host || '—'}</span>
          </div>
        </FieldRow>
      </FieldSection>
    </div>
  );
}

function maskPassword(pwd: string) {
  if (!pwd) return '—';
  const len = Math.max(6, Math.min(12, pwd.length));
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
