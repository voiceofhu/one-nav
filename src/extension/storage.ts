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
};

function ensureChromeStorage(): LocalStorageArea | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as {
    chrome?: { storage?: { local?: LocalStorageArea } };
  };
  return w.chrome?.storage?.local;
}

const KEY_PREFIX = 'onenav:meta:';

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
