-- Add missing columns to existing tables

-- Add downloads and stars columns to rules table
ALTER TABLE rules ADD COLUMN downloads INTEGER NOT NULL DEFAULT 0;
ALTER TABLE rules ADD COLUMN stars INTEGER NOT NULL DEFAULT 0;

-- Create rule_stars table for tracking user stars
CREATE TABLE IF NOT EXISTS rule_stars (
    id TEXT PRIMARY KEY,
    rule_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(rule_id, user_id)
);

-- Create rule_downloads table for tracking downloads
CREATE TABLE IF NOT EXISTS rule_downloads (
    id TEXT PRIMARY KEY,
    rule_id TEXT NOT NULL,
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add team_id to rules table for team visibility
ALTER TABLE rules ADD COLUMN team_id TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_rules_downloads ON rules(downloads);
CREATE INDEX IF NOT EXISTS idx_rules_stars ON rules(stars);
CREATE INDEX IF NOT EXISTS idx_rules_team_id ON rules(team_id);
CREATE INDEX IF NOT EXISTS idx_rule_stars_rule_id ON rule_stars(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_stars_user_id ON rule_stars(user_id);
CREATE INDEX IF NOT EXISTS idx_rule_downloads_rule_id ON rule_downloads(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_downloads_created_at ON rule_downloads(created_at);