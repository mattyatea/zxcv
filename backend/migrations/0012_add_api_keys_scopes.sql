-- Add scopes column to api_keys table if it doesn't exist
-- This migration handles cases where the api_keys table was created without the scopes column

-- First, check if we need to add the column by creating a temporary table with the new schema
CREATE TABLE IF NOT EXISTS api_keys_new (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    last_used_at INTEGER,
    expires_at INTEGER,
    scopes TEXT, -- JSON array of allowed scopes
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Copy existing data if any
INSERT INTO api_keys_new (id, user_id, name, key_hash, last_used_at, expires_at, created_at)
SELECT id, user_id, name, key_hash, last_used_at, expires_at, created_at 
FROM api_keys
WHERE EXISTS (SELECT 1 FROM api_keys LIMIT 1);

-- Drop the old table
DROP TABLE IF EXISTS api_keys;

-- Rename the new table
ALTER TABLE api_keys_new RENAME TO api_keys;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);