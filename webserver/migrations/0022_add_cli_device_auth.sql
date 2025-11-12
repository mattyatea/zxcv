-- Device Code table for CLI authentication (OAuth Device Authorization Grant)
CREATE TABLE device_codes (
    id TEXT PRIMARY KEY,
    device_code TEXT NOT NULL UNIQUE,
    user_code TEXT NOT NULL UNIQUE,
    is_approved INTEGER NOT NULL DEFAULT 0,
    user_id TEXT,
    client_id TEXT NOT NULL,
    scope TEXT,
    expires_at INTEGER NOT NULL,
    interval INTEGER NOT NULL DEFAULT 5,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    last_attempt INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_device_codes_device_code ON device_codes(device_code);
CREATE INDEX idx_device_codes_user_code ON device_codes(user_code);
CREATE INDEX idx_device_codes_expires_at ON device_codes(expires_at);

-- CLI Token table for persistent CLI authentication
CREATE TABLE cli_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT 'CLI Token',
    client_id TEXT NOT NULL,
    last_used_at INTEGER,
    expires_at INTEGER,
    scope TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_cli_tokens_token_hash ON cli_tokens(token_hash);
CREATE INDEX idx_cli_tokens_user_id ON cli_tokens(user_id);
CREATE INDEX idx_cli_tokens_expires_at ON cli_tokens(expires_at);