-- Add content_type field to rules table to support both rules and agents
ALTER TABLE rules ADD COLUMN content_type TEXT NOT NULL DEFAULT 'rule';

-- Create index for filtering by content type
CREATE INDEX idx_rules_content_type ON rules(content_type);