'use client';

import { useMemo, useState } from 'react';

import { AboutSection } from './components/AboutSection';
import { GeneralSettingsSection } from './components/GeneralSettingsSection';
import { ImportExportSection } from './components/ImportExportSection';
import { LinkHealthSection } from './components/LinkHealthSection';
import { OptionsLayout } from './components/OptionsLayout';
import {
  type OptionsSection,
  OptionsSidebar,
} from './components/OptionsSidebar';

const SECTION_TITLES: Record<OptionsSection, string> = {
  general: '基础设置',
  'import-export': '导入 / 导出',
  'link-health': '链接体检',
  about: '关于 OneNav',
};

export default function OptionsPage() {
  const [section, setSection] = useState<OptionsSection>('general');
  const title = useMemo(() => SECTION_TITLES[section], [section]);

  return (
    <OptionsLayout
      sidebar={<OptionsSidebar active={section} onSelect={setSection} />}
      title={title}
      description={
        section === 'general'
          ? '配置默认视图与交互偏好，让 OneNav 更贴合你的使用习惯。'
          : section === 'import-export'
            ? '备份或迁移你的书签数据，导入时会合并至当前根目录。'
            : section === 'link-health'
              ? '检测书签链接可用性，并批量移除失效项保持列表整洁。'
              : '了解 OneNav 的版本信息与常用链接。'
      }
    >
      <div className="space-y-8">
        {section === 'general' && <GeneralSettingsSection />}
        {section === 'import-export' && <ImportExportSection />}
        {section === 'link-health' && <LinkHealthSection />}
        {section === 'about' && <AboutSection />}
      </div>
    </OptionsLayout>
  );
}
