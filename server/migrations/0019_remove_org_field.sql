-- Remove the deprecated org field from rules table
-- First, drop the index on org
DROP INDEX IF EXISTS idx_rules_org;

-- Create new table without org field
CREATE TABLE rules_new (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    visibility TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    published_at INTEGER,
    version TEXT NOT NULL DEFAULT '1.0.0',
    latest_version_id TEXT,
    downloads INTEGER NOT NULL DEFAULT 0,
    stars INTEGER NOT NULL DEFAULT 0,
    organization_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Copy data from old table
INSERT INTO rules_new (
    id, name, user_id, visibility, description, tags,
    created_at, updated_at, published_at, version,
    latest_version_id, downloads, stars, organization_id
)
SELECT 
    id, name, user_id, visibility, description, tags,
    created_at, updated_at, published_at, version,
    latest_version_id, downloads, stars, organization_id
FROM rules;

-- Drop old table
DROP TABLE rules;

-- Rename new table
ALTER TABLE rules_new RENAME TO rules;

-- Recreate indexes
CREATE INDEX idx_rules_user_id ON rules(user_id);
CREATE INDEX idx_rules_visibility ON rules(visibility);
CREATE INDEX idx_rules_name ON rules(name);
CREATE INDEX idx_rules_updated_at ON rules(updated_at);
CREATE INDEX idx_rules_organization_id ON rules(organization_id);