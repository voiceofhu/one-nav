'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

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

const OPTION_TARGET_STORAGE_KEY = 'onenav:options:target-section';

function isOptionsSection(value: string | null): value is OptionsSection {
  return (
    value === 'general' ||
    value === 'import-export' ||
    value === 'link-health' ||
    value === 'about'
  );
}

export default function OptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">加载中...</div>
      }
    >
      <OptionsPageContent />
    </Suspense>
  );
}

function OptionsPageContent() {
  const params = useSearchParams();
  const sectionParam = params.get('section');
  const [section, setSection] = useState<OptionsSection>('general');

  useEffect(() => {
    if (isOptionsSection(sectionParam)) {
      setSection(sectionParam);
      if (typeof window !== 'undefined') {
        window.localStorage?.removeItem(OPTION_TARGET_STORAGE_KEY);
      }
      return;
    }

    if (typeof window === 'undefined') return;
    const stored =
      window.localStorage?.getItem(OPTION_TARGET_STORAGE_KEY) ?? null;
    if (isOptionsSection(stored)) {
      setSection(stored);
      window.localStorage.removeItem(OPTION_TARGET_STORAGE_KEY);
    }
  }, [sectionParam]);

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
