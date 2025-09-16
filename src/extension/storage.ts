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
