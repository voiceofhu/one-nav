'use client';

import { type AccountCredential } from '@/extension/storage';
import { ShieldAlert, ShieldCheck, ShieldX, Star } from 'lucide-react';
import { JSX } from 'react';

interface SecurityCardProps {
  account: AccountCredential;
}

export function SecurityCard({ account }: SecurityCardProps) {
  const { score, title, description, className, icon } =
    assessSecurityDetailed(account);

  return (
    <div className={`mx-2 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold mb-1 flex items-center">
            {title}
            <div className="ml-2 flex items-center text-[10px] text-current/80">
              <Star className="h-3 w-3 mr-1" fill="currentColor" />
              {score} 分
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-current/80">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SecurityAssessmentResult {
  score: number;
  title: string;
  description: string;
  className: string;
  icon: JSX.Element;
}

function assessSecurityDetailed(
  account: AccountCredential,
): SecurityAssessmentResult {
  let score = 0;
  const pwd = account.password?.trim() ?? '';
  const hasPassword = pwd.length > 0;
  const hasTotp = Boolean(account.totp?.trim());

  // 1. 密码长度 (最多 40 分)
  if (hasPassword) {
    score += Math.min(pwd.length * 3, 40); // 每字符3分，最多40分
  }

  // 2. 密码字符类型 (最多 30 分)
  if (hasPassword) {
    let charTypes = 0;
    if (/[a-z]/.test(pwd)) charTypes++;
    if (/[A-Z]/.test(pwd)) charTypes++;
    if (/[0-9]/.test(pwd)) charTypes++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) charTypes++; // 特殊字符

    score += charTypes * 8; // 每种字符类型增加8分
    if (charTypes >= 4) score += 5; // 如果包含所有四种类型，额外加5分
  }

  // 3. 是否使用二步验证 (最多 30 分)
  if (hasTotp) {
    score += 30;
  }

  // 确保分数不超过100
  score = Math.min(score, 100);

  let title: string;
  let description: string;
  let className: string;
  let icon: JSX.Element;

  if (!hasPassword && !hasTotp) {
    score = 0; // 如果没有设置任何安全信息，强制设置为0分
    title = '未设置安全信息';
    description = '请立即设置密码和二步验证以保护您的账户。';
    icon = <ShieldX className="h-4 w-4" />;
    className =
      'rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-rose-100/80 px-4 py-4 text-[11px] text-rose-800 backdrop-blur-sm dark:border-rose-700/60 dark:from-rose-950/80 dark:to-rose-900/60 dark:text-rose-100';
  } else if (score >= 90) {
    title = '非常安全';
    description = '密码强度极高，并已启用二步验证，账户安全防护非常完善。';
    icon = <ShieldCheck className="h-4 w-4" />;
    className =
      'rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-emerald-100/80 px-4 py-4 text-[11px] text-emerald-800 backdrop-blur-sm dark:border-emerald-700/60 dark:from-emerald-950/80 dark:to-emerald-900/60 dark:text-emerald-100';
  } else if (score >= 70) {
    title = '安全性很好';
    description = '已采取良好的安全措施，但仍有提升空间，例如增加密码复杂度。';
    icon = <ShieldCheck className="h-4 w-4" />;
    className =
      'rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-emerald-100/80 px-4 py-4 text-[11px] text-emerald-800 backdrop-blur-sm dark:border-emerald-700/60 dark:from-emerald-950/80 dark:to-emerald-900/60 dark:text-emerald-100';
  } else if (score >= 40) {
    // 调整中等安全的分数范围
    title = '安全性一般';
    description = '建议同时使用强密码与二步验证来提升账户安全性。';
    icon = <ShieldAlert className="h-4 w-4" />;
    className =
      'rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-amber-100/80 px-4 py-4 text-[11px] text-amber-800 backdrop-blur-sm dark:border-amber-700/60 dark:from-amber-950/80 dark:to-amber-900/60 dark:text-amber-100';
  } else {
    title = '安全性较弱';
    description = '账户安全防护不足，存在较高风险，请尽快完善安全设置。';
    icon = <ShieldX className="h-4 w-4" />;
    className =
      'rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-rose-100/80 px-4 py-4 text-[11px] text-rose-800 backdrop-blur-sm dark:border-rose-700/60 dark:from-rose-950/80 dark:to-rose-900/60 dark:text-rose-100';
  }

  return { score, title, description, className, icon };
}
