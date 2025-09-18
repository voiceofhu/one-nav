'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

import { useOptionsSettings } from '../hooks/use-options-settings';

export function GeneralSettingsSection() {
  const { settings, updateSetting } = useOptionsSettings();

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">启动视图</h2>
          <p className="text-xs text-muted-foreground">
            选择 OneNav 弹出层默认展示的列表视图。
          </p>
        </div>
        <div className="flex items-center gap-6 rounded-lg border border-transparent bg-white/70 px-4 py-3 shadow-sm ring-1 ring-black/5">
          <div className="flex-1 space-y-1">
            <Label className="text-sm font-medium text-foreground">
              默认打开
            </Label>
            <p className="text-xs text-muted-foreground">
              打开弹出层时首先看到的列表。
            </p>
          </div>
          <Select
            value={settings.defaultView}
            onValueChange={(value: 'recents' | 'all') =>
              updateSetting('defaultView', value)
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择默认视图" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recents">最近添加</SelectItem>
              <SelectItem value="all">全部书签</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">交互</h2>
          <p className="text-xs text-muted-foreground">
            调整打开书签和详情面板的交互偏好。
          </p>
        </div>

        <div className="space-y-3 rounded-lg border border-transparent bg-white/70 px-4 py-3 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">新标签页打开书签</div>
              <div className="text-xs text-muted-foreground">
                在弹出层或列表中点击书签时，始终在新的浏览器标签页中打开。
              </div>
            </div>
            <Switch
              checked={settings.openLinksInNewTab}
              onCheckedChange={(value) =>
                updateSetting('openLinksInNewTab', value)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">显示右侧详情面板</div>
              <div className="text-xs text-muted-foreground">
                在弹出层选择书签时，默认展开详情面板以编辑或查看附加信息。
              </div>
            </div>
            <Switch
              checked={settings.showBookmarkDetails}
              onCheckedChange={(value) =>
                updateSetting('showBookmarkDetails', value)
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
