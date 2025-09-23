'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type AccountCredential } from '@/extension/storage';
import { useCopy, usePaste } from '@/hooks/use-copy';
import { Copy, Eye, EyeOff, Globe2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { TotpDisplay } from './TotpDisplay';

/**
 * ------------------------------
 * Account Cards (Refactored)
 * ------------------------------
 *
 * ✨ 重构改进
 * - 组件拆分：将复杂组件拆分为多个专职子组件
 * - 简化交互：hover显示背景，点击复制，移除多余按钮
 * - 左右布局：标签在左，内容在右，整体更紧凑
 * - 统一头部：头部信息整合为一个完整区域
 */

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
  const { copy } = useCopy();

  function handleCopy(text: string) {
    if (!text) return;
    copy(text);
  }

  const displayTitle =
    title ||
    account.label ||
    (account.username ? `${account.username}@${host}` : host) ||
    '账号信息';

  return (
    <div className="group rounded-2xl border border-border/60 bg-card/90 px-5 py-4 shadow-sm transition-all hover:shadow-md backdrop-blur-sm">
      {/* 统一头部 */}
      <AccountCardHeader
        title={displayTitle}
        host={host}
        url={url}
        updatedAt={updatedAt}
      />

      {/* 账号信息区域 */}
      <div className="mt-4 space-y-3">
        <AccountFieldRow
          label="用户名"
          value={account.username}
          onCopy={() => handleCopy(account.username)}
        />

        <PasswordFieldRow
          value={account.password}
          onCopy={() => handleCopy(account.password)}
        />

        <TotpFieldRow totp={account.totp} />

        <AccountFieldRow
          label="网站"
          value={host}
          onCopy={() => handleCopy(host)}
        />
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
  const { copy } = useCopy();
  const { paste, isPasting } = usePaste();

  function handleCopy(value: string) {
    if (!value) return;
    copy(value);
  }

  async function pasteTotp() {
    const text = await paste();
    if (text) {
      onChange(index, { totp: text });
      toast.success('已粘贴验证码');
    }
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/90 px-5 py-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
      {/* 编辑状态头部 */}
      <EditableCardHeader index={index} onRemove={() => onRemove(index)} />

      {/* 编辑字段区域 */}
      <div className="mt-4 space-y-3">
        <EditableFieldRow
          label="显示名称"
          value={account.label || ''}
          placeholder="可选：例如主账号"
          onChange={(v: string) => onChange(index, { label: v })}
        />

        <EditableFieldRow
          label="用户名"
          value={account.username || ''}
          placeholder="example@gmail.com"
          onChange={(v: string) => onChange(index, { username: v })}
          onCopy={() => handleCopy(account.username || '')}
        />

        <EditableFieldRow
          label="密码"
          value={account.password || ''}
          placeholder="填写密码"
          type="password"
          onChange={(v: string) => onChange(index, { password: v })}
          onCopy={() => handleCopy(account.password || '')}
        />

        <EditableTotpField
          value={account.totp || ''}
          onChange={(v) => onChange(index, { totp: v })}
          onPaste={pasteTotp}
          onCopy={() => handleCopy(account.totp || '')}
          isPasting={isPasting}
        />

        <FieldRow label="网站" value={host || '—'} readOnly />
      </div>
    </div>
  );
}

/**
 * ------------------------------
 * 子组件定义
 * ------------------------------
 */

// 账号卡片头部
function AccountCardHeader({
  title,
  host,
  url,
  updatedAt,
}: {
  title: string;
  host: string;
  url?: string;
  updatedAt?: number;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold tracking-tight text-foreground">
          {title}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{host}</span>
          {updatedAt && (
            <>
              <span>•</span>
              <span>{formatDate(updatedAt)}</span>
            </>
          )}
        </div>
      </div>
      {url && (
        <a
          href={url}
          className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-[11px] text-primary transition-colors hover:border-primary/30 hover:bg-primary/10"
          target="_blank"
          rel="noreferrer"
          title="打开网站"
        >
          <Globe2 className="h-3.5 w-3.5" />
          打开
        </a>
      )}
    </div>
  );
}

// 普通字段行
function AccountFieldRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value?: string;
  onCopy?: () => void;
}) {
  const displayValue = value || '—';
  const isEmpty = !value;

  return (
    <FieldRow label={label}>
      <div
        className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-[12px] transition-all ${
          isEmpty
            ? 'bg-muted/30 text-muted-foreground cursor-default'
            : 'bg-muted/40 text-foreground cursor-pointer hover:bg-background/70 hover:shadow-sm active:scale-[0.995]'
        }`}
        onClick={isEmpty ? undefined : onCopy}
        title={isEmpty ? undefined : '点击复制'}
        role={isEmpty ? undefined : 'button'}
      >
        <span className="truncate">{displayValue}</span>
        {!isEmpty && (
          <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
    </FieldRow>
  );
}

// 密码字段行
function PasswordFieldRow({
  value,
  onCopy,
}: {
  value?: string;
  onCopy?: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isEmpty = !value;
  const displayValue = isEmpty
    ? '—'
    : showPassword
      ? value
      : maskPassword(value);

  return (
    <FieldRow label="密码">
      <div className="group flex items-center gap-2">
        <div
          className={`flex-1 rounded-xl px-3 py-2.5 font-mono text-[12px] transition-all ${
            isEmpty
              ? 'bg-muted/30 text-muted-foreground cursor-default'
              : 'bg-muted/40 text-foreground cursor-pointer hover:bg-background/70 hover:shadow-sm active:scale-[0.995]'
          }`}
          onClick={isEmpty ? undefined : onCopy}
          title={isEmpty ? undefined : '点击复制密码'}
          role={isEmpty ? undefined : 'button'}
        >
          {displayValue}
        </div>
        {!isEmpty && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            title={showPassword ? '隐藏密码' : '显示密码'}
          >
            {showPassword ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
    </FieldRow>
  );
}

// TOTP 字段行
function TotpFieldRow({ totp }: { totp?: string }) {
  return (
    <FieldRow label="验证码">
      <div className="rounded-xl bg-muted/40 px-3 py-2.5">
        <TotpDisplay totp={totp} />
      </div>
    </FieldRow>
  );
}

// 编辑卡片头部
function EditableCardHeader({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[13px] font-semibold text-foreground">
        账号 {index + 1}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-[10px] text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
        onClick={onRemove}
        title="删除账号"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// 可编辑字段行
function EditableFieldRow({
  label,
  value,
  placeholder,
  type = 'text',
  onChange,
  onCopy,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
  onCopy?: () => void;
}) {
  return (
    <FieldRow label={label}>
      <div className="relative">
        <Input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 rounded-xl pr-10 text-[12px]"
        />
        {onCopy && value && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 my-1 mr-1 inline-flex items-center rounded-lg px-2 text-[10px] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            onClick={onCopy}
            title="复制"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </FieldRow>
  );
}

// 可编辑 TOTP 字段
function EditableTotpField({
  value,
  onChange,
  onPaste,
  onCopy,
  isPasting,
}: {
  value: string;
  onChange: (value: string) => void;
  onPaste: () => void;
  onCopy?: () => void;
  isPasting: boolean;
}) {
  return (
    <FieldRow
      label="验证码"
      actions={
        value ? (
          <div className="flex items-center gap-1">
            <TotpDisplay totp={value} compact />
            {onCopy && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                onClick={onCopy}
                title="复制设置"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => onChange('')}
              title="清空"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[10px] border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
            onClick={onPaste}
            disabled={isPasting}
            title="从剪贴板粘贴"
          >
            {isPasting ? '粘贴中...' : '粘贴'}
          </Button>
        )
      }
    >
      <Textarea
        value={value}
        placeholder="otpauth:// 或 Base32 密钥"
        rows={2}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[55px] rounded-xl text-[11px]"
      />
    </FieldRow>
  );
}

// 基础字段行容器
function FieldRow({
  label,
  value,
  children,
  actions,
  readOnly = false,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  readOnly?: boolean;
}) {
  if (children) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">
            {label}
          </span>
          {actions}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <div
        className={`rounded-xl px-3 py-2.5 text-[12px] ${
          readOnly
            ? 'bg-muted/30 text-muted-foreground'
            : 'bg-muted/40 text-foreground'
        }`}
      >
        {value || '—'}
      </div>
    </div>
  );
}

function formatDate(ts?: number) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}/${m}/${day}`;
  } catch (e) {
    return '';
  }
}

function maskPassword(pwd?: string) {
  if (!pwd) return '—';
  const len = Math.max(8, Math.min(12, pwd.length));
  return '•'.repeat(len);
}
