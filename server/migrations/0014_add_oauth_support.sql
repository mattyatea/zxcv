-- Add OAuth support tables

-- Make password_hash nullable for OAuth users
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_username;

CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT, -- Now nullable for OAuth users
    email_verified BOOLEAN NOT NULL DEFAULT 0,
    settings TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO users_new SELECT * FROM users;
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Create OAuth accounts table
CREATE TABLE oauth_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    email TEXT,
    username TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(provider, provider_id)
);

CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider);

-- Create OAuth state table for CSRF protection
CREATE TABLE oauth_states (
    id TEXT PRIMARY KEY,
    state TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL,
    code_verifier TEXT,
    redirect_url TEXT,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_oauth_states_state ON oauth_states(state);
CREATE INDEX idx_oauth_states_expires_at ON oauth_states(expires_at);