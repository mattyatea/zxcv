-- Update visibility constraint to only allow 'public' and 'private'
-- Since SQLite doesn't support ALTER TABLE to modify CHECK constraints,
-- we need to recreate the table with the new constraint

-- Disable foreign key constraints
PRAGMA foreign_keys=OFF;

-- Step 1: Create a new table with the updated constraint
CREATE TABLE rules_temp (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    org TEXT,
    user_id TEXT NOT NULL,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
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

-- Step 2: Copy all data from the existing table
-- Convert any 'organization' visibility to 'private'
INSERT INTO rules_temp SELECT 
    id,
    name,
    org,
    user_id,
    CASE WHEN visibility = 'organization' THEN 'private' ELSE visibility END as visibility,
    description,
    tags,
    created_at,
    updated_at,
    published_at,
    version,
    latest_version_id,
    downloads,
    stars,
    organization_id
FROM rules;

-- Step 3: Drop the old table
DROP TABLE rules;

-- Step 4: Rename the new table
ALTER TABLE rules_temp RENAME TO rules;

-- Step 5: Recreate all indexes
CREATE INDEX rules_user_id_idx ON rules(user_id);
CREATE INDEX rules_created_at_idx ON rules(created_at);
CREATE INDEX rules_updated_at_idx ON rules(updated_at);
CREATE INDEX rules_visibility_idx ON rules(visibility);
CREATE INDEX rules_organization_id_idx ON rules(organization_id);
CREATE UNIQUE INDEX rules_name_organization_id_unique ON rules(name, organization_id) WHERE organization_id IS NOT NULL;
CREATE UNIQUE INDEX rules_name_user_id_null_org_unique ON rules(name, user_id) WHERE organization_id IS NULL;

-- Re-enable foreign key constraints
PRAGMA foreign_keys=ON;