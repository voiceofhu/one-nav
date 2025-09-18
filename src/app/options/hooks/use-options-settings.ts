'use client';

import { useCallback, useEffect, useState } from 'react';

type OptionsSettings = {
  defaultView: 'recents' | 'all';
  openLinksInNewTab: boolean;
  showBookmarkDetails: boolean;
};

const STORAGE_KEY = 'one-nav-options-settings';

const DEFAULT_SETTINGS: OptionsSettings = {
  defaultView: 'recents',
  openLinksInNewTab: true,
  showBookmarkDetails: true,
};

function readStoredSettings(): OptionsSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<OptionsSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    } satisfies OptionsSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useOptionsSettings() {
  const [settings, setSettings] = useState<OptionsSettings>(() =>
    readStoredSettings(),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to persist options settings', err);
    }
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof OptionsSettings>(key: K, value: OptionsSettings[K]) => {
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  return { settings, updateSetting };
}

export type { OptionsSettings };
