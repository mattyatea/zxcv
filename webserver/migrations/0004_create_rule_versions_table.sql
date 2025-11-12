-- Create rule versions table
CREATE TABLE IF NOT EXISTS rule_versions (
    id TEXT PRIMARY KEY,
    rule_id TEXT NOT NULL,
    version_number TEXT NOT NULL,
    changelog TEXT,
    content_hash TEXT NOT NULL,
    r2_object_key TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_by TEXT NOT NULL,
    FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE(rule_id, version_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rule_versions_rule_id ON rule_versions(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_versions_created_at ON rule_versions(created_at);