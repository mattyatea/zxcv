-- Rename downloads column to views in rules table
ALTER TABLE rules RENAME COLUMN downloads TO views;

-- Rename rule_downloads table to rule_views
ALTER TABLE rule_downloads RENAME TO rule_views;

-- Update indexes (SQLite doesn't support renaming indexes, so we need to recreate them)
-- The indexes are automatically renamed with the table