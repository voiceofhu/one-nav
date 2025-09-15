-- -----------------------------------------------------------------------------
-- Onenav Chrome Extension Database Schema (SQLite)
--
-- This schema focuses on storing Onenav-specific data that is not managed
-- directly by Chrome's native bookmark API, such as extended bookmark
-- properties, encrypted passwords, and TOTP secrets.
--
-- Bookmark core data (URL, Title, Folder structure) is primarily handled
-- by the Chrome Bookmarks API and synchronized.
-- -----------------------------------------------------------------------------

-- Table: Onenav_Settings
-- Stores application-level settings and user preferences for the extension.
CREATE TABLE IF NOT EXISTS Onenav_Settings (
    setting_key     TEXT PRIMARY KEY NOT NULL, -- Unique key for the setting
    setting_value   TEXT                      -- Value of the setting (e.g., JSON string, boolean, text)
);

-- Example settings:
-- INSERT INTO Onenav_Settings (setting_key, setting_value) VALUES ('cloud_sync_enabled', 'true');
-- INSERT INTO Onenav_Settings (setting_key, setting_value) VALUES ('last_sync_timestamp', '1678886400');


-- Table: Onenav_Bookmarks_Extended
-- Stores extended properties for bookmarks that are not natively supported
-- or stored by the Chrome Bookmarks API. These properties are associated
-- with Chrome bookmarks via their unique bookmark_id.
CREATE TABLE IF NOT EXISTS Onenav_Bookmarks_Extended (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    chrome_bookmark_id TEXT NOT UNIQUE NOT NULL, -- Corresponds to Chrome's bookmark.id
    description     TEXT,                         -- More detailed description than Chrome's title
    tags            TEXT,                         -- Comma-separated or JSON string for Onenav-specific tags
    icon_url        TEXT,                         -- Custom icon URL for the bookmark (if different from favicon)
    custom_order    INTEGER,                      -- Onenav-specific custom display order (if not syncable to Chrome)
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient lookup by Chrome Bookmark ID
CREATE INDEX IF NOT EXISTS idx_chrome_bookmark_id ON Onenav_Bookmarks_Extended (chrome_bookmark_id);


-- Table: Onenav_Credentials
-- Stores encrypted web account credentials (username/password).
-- These are logically associated with URLs, which may or may not be bookmarks.
CREATE TABLE IF NOT EXISTS Onenav_Credentials (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    url_pattern     TEXT NOT NULL,                     -- URL pattern (e.g., "example.com/*") for matching login pages
    username_enc    TEXT NOT NULL,                     -- Encrypted username
    password_enc    TEXT NOT NULL,                     -- Encrypted password
    notes_enc       TEXT,                              -- Encrypted additional notes
    chrome_bookmark_id TEXT,                         -- Optional: Link to a specific Chrome bookmark ID if applicable
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient lookup by URL pattern
CREATE INDEX IF NOT EXISTS idx_url_pattern ON Onenav_Credentials (url_pattern);


-- Table: Onenav_TOTP_Secrets
-- Stores encrypted Time-based One-Time Password (TOTP) secrets.
-- These are also logically associated with URLs.
CREATE TABLE IF NOT EXISTS Onenav_TOTP_Secrets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    url_pattern     TEXT NOT NULL,                     -- URL pattern for matching
    secret_enc      TEXT NOT NULL,                     -- Encrypted TOTP secret
    issuer          TEXT,                              -- Issuer name (e.g., "Google", "GitHub")
    label           TEXT,                              -- Label for the TOTP entry (e.g., "john.doe@example.com")
    chrome_bookmark_id TEXT,                         -- Optional: Link to a specific Chrome bookmark ID if applicable
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient lookup by URL pattern
CREATE INDEX IF NOT EXISTS idx_totp_url_pattern ON Onenav_TOTP_Secrets (url_pattern);


-- Trigger: Update `updated_at` column automatically for Onenav_Bookmarks_Extended
CREATE TRIGGER IF NOT EXISTS update_Onenav_Bookmarks_Extended_updated_at
AFTER UPDATE ON Onenav_Bookmarks_Extended
FOR EACH ROW
BEGIN
    UPDATE Onenav_Bookmarks_Extended SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger: Update `updated_at` column automatically for Onenav_Credentials
CREATE TRIGGER IF NOT EXISTS update_Onenav_Credentials_updated_at
AFTER UPDATE ON Onenav_Credentials
FOR EACH ROW
BEGIN
    UPDATE Onenav_Credentials SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger: Update `updated_at` column automatically for Onenav_TOTP_Secrets
CREATE TRIGGER IF NOT EXISTS update_Onenav_TOTP_Secrets_updated_at
AFTER UPDATE ON Onenav_TOTP_Secrets
FOR EACH ROW
BEGIN
    UPDATE Onenav_TOTP_Secrets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;