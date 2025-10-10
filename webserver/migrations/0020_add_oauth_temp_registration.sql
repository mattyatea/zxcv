-- Create OAuth temporary registration table
CREATE TABLE IF NOT EXISTS oauth_temp_registrations (
    id TEXT PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    email TEXT NOT NULL,
    provider_username TEXT,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_oauth_temp_registrations_token ON oauth_temp_registrations(token);
CREATE INDEX IF NOT EXISTS idx_oauth_temp_registrations_expires_at ON oauth_temp_registrations(expires_at);