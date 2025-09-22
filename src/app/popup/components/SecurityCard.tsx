'use client';

import { type AccountCredential } from '@/extension/storage';
import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

interface SecurityCardProps {
  account: AccountCredential;
}

export function SecurityCard({ account }: SecurityCardProps) {
  const status = assessSecurity(account);
  if (!status) return null;

  const tone =
    status === 'strong'
      ? {
          icon: <ShieldCheck className="h-4 w-4" />,
          title: '强密码与验证码',
          description:
            '此密码较长、不易猜到且唯一。配合验证码可在密码被盗时保护账号。',
          className:
            'rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-emerald-100/80 px-4 py-4 text-[11px] text-emerald-800 shadow-lg backdrop-blur-sm dark:border-emerald-700/60 dark:from-emerald-950/80 dark:to-emerald-900/60 dark:text-emerald-100',
        }
      : status === 'medium'
        ? {
            icon: <ShieldAlert className="h-4 w-4" />,
            title: '安全性一般',
            description: '建议同时使用强密码与验证码来提升账号安全性。',
            className:
              'rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-amber-100/80 px-4 py-4 text-[11px] text-amber-800 shadow-lg backdrop-blur-sm dark:border-amber-700/60 dark:from-amber-950/80 dark:to-amber-900/60 dark:text-amber-100',
          }
        : {
            icon: <ShieldX className="h-4 w-4" />,
            title: '安全性较弱',
            description: '尚未配置强密码或验证码，请尽快完善账号安全设置。',
            className:
              'rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-rose-100/80 px-4 py-4 text-[11px] text-rose-800 shadow-lg backdrop-blur-sm dark:border-rose-700/60 dark:from-rose-950/80 dark:to-rose-900/60 dark:text-rose-100',
          };

  return (
    <div className={tone.className}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{tone.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold mb-1">{tone.title}</div>
          <p className="text-[11px] leading-relaxed text-current/80">
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
