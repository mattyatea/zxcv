-- Create rules table
CREATE TABLE IF NOT EXISTS rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    org TEXT,
    user_id TEXT NOT NULL,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private', 'team')),
    description TEXT,
    tags TEXT, -- JSON array stored as text
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    published_at INTEGER,
    version TEXT NOT NULL DEFAULT '1.0.0',
    latest_version_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(name, org)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rules_user_id ON rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_visibility ON rules(visibility);
CREATE INDEX IF NOT EXISTS idx_rules_org ON rules(org);
CREATE INDEX IF NOT EXISTS idx_rules_name ON rules(name);
CREATE INDEX IF NOT EXISTS idx_rules_updated_at ON rules(updated_at);