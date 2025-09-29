// Simple storage wrapper for extension/local dev to persist bookmark metadata
// Falls back to localStorage when chrome.storage is unavailable.

export type AccountCredential = {
  username: string;
  password: string;
  totp?: string; // otpauth URL or secret
  label?: string;
};

export type BookmarkMeta = {
  accounts: AccountCredential[];
};

export type BookmarkMetaMap = Record<string, BookmarkMeta>;

type LocalStorageArea = {
  get: (
    keys: string[] | Record<string, unknown>,
    callback: (results: Record<string, unknown>) => void,
  ) => void;
  set: (items: Record<string, unknown>, callback: () => void) => void;
  remove?: (keys: string | string[], callback?: () => void) => void;
};

function ensureChromeStorage(): LocalStorageArea | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as {
    chrome?: { storage?: { local?: LocalStorageArea } };
  };
  return w.chrome?.storage?.local;
}

const KEY_PREFIX = 'onenav:meta:';
const POPUP_STATE_KEY = 'onenav:popup:params';

export async function getBookmarkMeta(
  id: string,
): Promise<BookmarkMeta | null> {
  const st = ensureChromeStorage();
  if (st) {
    return new Promise((resolve) => {
      st.get([KEY_PREFIX + id], (res) => {
        resolve((res?.[KEY_PREFIX + id] as BookmarkMeta) || null);
      });
    });
  }
  try {
    const raw = localStorage.getItem(KEY_PREFIX + id);
    return raw ? (JSON.parse(raw) as BookmarkMeta) : null;
  } catch {
    return null;
  }
}

export async function setBookmarkMeta(id: string, meta: BookmarkMeta) {
  const st = ensureChromeStorage();
  if (st) {
    return new Promise<void>((resolve) => {
      st.set({ [KEY_PREFIX + id]: meta }, () => resolve());
    });
  }
  localStorage.setItem(KEY_PREFIX + id, JSON.stringify(meta));
}

export async function getPopupStateParams(): Promise<string | null> {
  const st = ensureChromeStorage();
  if (st) {
    return new Promise((resolve) => {
      st.get([POPUP_STATE_KEY], (res) => {
        const raw = res?.[POPUP_STATE_KEY];
        resolve(typeof raw === 'string' && raw.length > 0 ? raw : null);
      });
    });
  }
  try {
    const raw = localStorage.getItem(POPUP_STATE_KEY);
    return raw && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

export async function setPopupStateParams(value: string | null | undefined) {
  const st = ensureChromeStorage();
  if (st) {
    return new Promise<void>((resolve) => {
      if (!value) {
        if (st.remove) {
          st.remove(POPUP_STATE_KEY, () => resolve());
        } else {
          st.set({ [POPUP_STATE_KEY]: '' }, () => resolve());
        }
        return;
      }
      st.set({ [POPUP_STATE_KEY]: value }, () => resolve());
    });
  }
  try {
    if (!value) {
      localStorage.removeItem(POPUP_STATE_KEY);
    } else {
      localStorage.setItem(POPUP_STATE_KEY, value);
    }
  } catch {
    // ignore persistence failures
  }
}

export async function getAllBookmarkMetas(): Promise<BookmarkMetaMap> {
  const st = ensureChromeStorage();
  if (st) {
    return new Promise((resolve) => {
      st.get({}, (items) => {
        const output: BookmarkMetaMap = {};
        for (const [key, value] of Object.entries(items ?? {})) {
          if (!key.startsWith(KEY_PREFIX)) continue;
          const id = key.slice(KEY_PREFIX.length);
          if (!id) continue;
          if (value && typeof value === 'object') {
            output[id] = value as BookmarkMeta;
          }
        }
        resolve(output);
      });
    });
  }

  const result: BookmarkMetaMap = {};
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(KEY_PREFIX)) continue;
      const id = key.slice(KEY_PREFIX.length);
      if (!id) continue;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          result[id] = JSON.parse(raw) as BookmarkMeta;
        }
      } catch (error) {
        console.warn('Failed to parse bookmark meta for export', error);
      }
    }
  } catch (error) {
    console.warn('Failed to enumerate local bookmark metadata', error);
  }
  return result;
}
