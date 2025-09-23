'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type AccountCredential } from '@/extension/storage';
import { Lock, Shield, User } from 'lucide-react';

interface AccountDisplayListProps {
  accounts: AccountCredential[];
  showSecurity?: boolean;
}

export function AccountDisplayList({
  accounts,
  showSecurity = false,
}: AccountDisplayListProps) {
  if (accounts.length === 0) {
    return (
      <div className="px-4 py-3">
        <div className="text-center py-8 text-xs text-muted-foreground">
          暂无账户信息
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="text-xs font-medium text-muted-foreground">
        账户信息 ({accounts.length})
      </div>

      <div className="space-y-2">
        {accounts.map((account, index) => (
          <AccountDisplayItem
            key={index}
            account={account}
            index={index}
            showSecurity={showSecurity}
          />
        ))}
      </div>
    </div>
  );
}

interface AccountDisplayItemProps {
  account: AccountCredential;
  index: number;
  showSecurity?: boolean;
}

function AccountDisplayItem({ account, index }: AccountDisplayItemProps) {
  return (
    <Card className="p-3">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <User className="h-3 w-3" />
          账户 {index + 1}
          {account.label && (
            <Badge variant="outline" className="text-xs">
              {account.label}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-2 text-xs">
        {account.username && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-12">用户名:</span>
            <span className="font-mono">{account.username}</span>
          </div>
        )}

        {account.password && (
          <div className="flex items-center gap-2">
            <Lock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">密码已保存</span>
          </div>
        )}

        {account.totp && (
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">两步验证已配置</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
