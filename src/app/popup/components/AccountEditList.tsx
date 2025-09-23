'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type AccountCredential } from '@/extension/storage';
import { Plus, Trash2 } from 'lucide-react';

interface AccountEditListProps {
  accounts: AccountCredential[];
  onAddAccount: () => void;
  onChangeAccount: (index: number, patch: Partial<AccountCredential>) => void;
  onRemoveAccount: (index: number) => void;
}

export function AccountEditList({
  accounts,
  onAddAccount,
  onChangeAccount,
  onRemoveAccount,
}: AccountEditListProps) {
  return (
    <div className="px-4 py-3 space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">账户信息</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddAccount}
          className="h-7 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          添加账户
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground">
          暂无账户信息，点击上方按钮添加
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account, index) => (
            <AccountEditItem
              key={index}
              account={account}
              index={index}
              onChangeAccount={onChangeAccount}
              onRemoveAccount={onRemoveAccount}
              showRemove={accounts.length > 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AccountEditItemProps {
  account: AccountCredential;
  index: number;
  onChangeAccount: (index: number, patch: Partial<AccountCredential>) => void;
  onRemoveAccount: (index: number) => void;
  showRemove: boolean;
}

function AccountEditItem({
  account,
  index,
  onChangeAccount,
  onRemoveAccount,
  showRemove,
}: AccountEditItemProps) {
  return (
    <div className="border rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">账户 {index + 1}</Label>
        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveAccount(index)}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <Label
            htmlFor={`username-${index}`}
            className="text-xs text-muted-foreground"
          >
            用户名
          </Label>
          <Input
            id={`username-${index}`}
            value={account.username || ''}
            onChange={(e) =>
              onChangeAccount(index, { username: e.target.value })
            }
            placeholder="用户名或邮箱"
            className="h-8 text-sm mt-1"
          />
        </div>

        <div>
          <Label
            htmlFor={`password-${index}`}
            className="text-xs text-muted-foreground"
          >
            密码
          </Label>
          <Input
            id={`password-${index}`}
            type="password"
            value={account.password || ''}
            onChange={(e) =>
              onChangeAccount(index, { password: e.target.value })
            }
            placeholder="密码"
            className="h-8 text-sm mt-1"
          />
        </div>

        <div>
          <Label
            htmlFor={`totp-${index}`}
            className="text-xs text-muted-foreground"
          >
            TOTP 密钥
          </Label>
          <Input
            id={`totp-${index}`}
            value={account.totp || ''}
            onChange={(e) => onChangeAccount(index, { totp: e.target.value })}
            placeholder="两步验证密钥（可选）"
            className="h-8 text-sm mt-1"
          />
        </div>

        <div>
          <Label
            htmlFor={`label-${index}`}
            className="text-xs text-muted-foreground"
          >
            标签
          </Label>
          <Input
            id={`label-${index}`}
            value={account.label || ''}
            onChange={(e) => onChangeAccount(index, { label: e.target.value })}
            placeholder="账户标签（可选）"
            className="h-8 text-sm mt-1"
          />
        </div>
      </div>
    </div>
  );
}
