-- Add config rule type and sub_type column to rules table
PRAGMA foreign_keys=OFF;

-- Create new table with updated schema to include config type and sub_type
CREATE TABLE rules_new (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'rule' CHECK (type IN ('rule', 'ccsubagents', 'config')),
    sub_type TEXT,
    visibility TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    published_at INTEGER,
    version TEXT NOT NULL DEFAULT '1.0.0',
    latest_version_id TEXT,
    views INTEGER NOT NULL DEFAULT 0,
    stars INTEGER NOT NULL DEFAULT 0,
    organization_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Copy existing data into new table
INSERT INTO rules_new (
    id, name, user_id, type, sub_type, visibility, description, tags,
    created_at, updated_at, published_at, version, latest_version_id, views, stars, organization_id
)
SELECT
    id, name, user_id, type, NULL, visibility, description, tags,
    created_at, updated_at, published_at, version, latest_version_id, views, stars, organization_id
FROM rules;

-- Drop old table and rename new one
DROP TABLE rules;
ALTER TABLE rules_new RENAME TO rules;

-- Recreate indexes
CREATE INDEX idx_rules_user_id ON rules(user_id);
CREATE INDEX idx_rules_visibility ON rules(visibility);
CREATE INDEX idx_rules_name ON rules(name);
CREATE INDEX idx_rules_updated_at ON rules(updated_at);
CREATE INDEX idx_rules_organization_id ON rules(organization_id);
CREATE INDEX idx_rules_type ON rules(type);

PRAGMA foreign_keys=ON;
