'use client';

import { Button } from '@/components/ui/button';
import { type AccountCredential } from '@/extension/storage';

import { AccountCard, EditableAccountCard } from './AccountCards';
import { BookmarkSection } from './BookmarkSection';

interface AccountsSectionProps {
  editing: boolean;
  accounts: AccountCredential[];
  draftAccounts: AccountCredential[];
  detailTitle: string;
  url: string;
  host: string;
  updatedAt?: number;
  onAddAccount: () => void;
  onChangeAccount: (index: number, patch: Partial<AccountCredential>) => void;
  onRemoveAccount: (index: number) => void;
}

export function AccountsSection({
  editing,
  accounts,
  draftAccounts,
  detailTitle,
  url,
  host,
  updatedAt,
  onAddAccount,
  onChangeAccount,
  onRemoveAccount,
}: AccountsSectionProps) {
  const displayAccounts = editing ? draftAccounts : accounts;

  return (
    <BookmarkSection
      title={`账号信息(${
        !editing && accounts.length > 0
          ? `共 ${accounts.length} 个账号`
          : undefined
      })`}
    >
      {!editing ? (
        <div className="space-y-3">
          {accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center dark:border-gray-600 dark:bg-gray-800">
              <div className="text-[12px] text-gray-500 dark:text-gray-400">
                暂未保存账号信息
              </div>
            </div>
          ) : (
            accounts.map((acc, index) => (
              <AccountCard
                key={`${acc.username}-${index}`}
                account={acc}
                title={detailTitle}
                url={url}
                host={host}
                updatedAt={updatedAt}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {draftAccounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center dark:border-gray-600 dark:bg-gray-800">
              <div className="text-[12px] text-gray-500 dark:text-gray-400">
                暂无账号，请点击下方按钮添加
              </div>
            </div>
          ) : (
            draftAccounts.map((acc, index) => (
              <EditableAccountCard
                key={index}
                index={index}
                account={acc}
                host={host}
                onChange={onChangeAccount}
                onRemove={onRemoveAccount}
              />
            ))
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl border border-dashed border-blue-300 bg-blue-50 py-3 text-[12px] font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-400 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
            onClick={onAddAccount}
          >
            + 添加账号
          </Button>
        </div>
      )}
    </BookmarkSection>
  );
}
