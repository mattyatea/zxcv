-- Add type column to rules table for distinguishing between rule and ccsubagents
ALTER TABLE rules ADD COLUMN type TEXT NOT NULL DEFAULT 'rule' CHECK (type IN ('rule', 'ccsubagents'));

-- Create index for type column
CREATE INDEX idx_rules_type ON rules(type);