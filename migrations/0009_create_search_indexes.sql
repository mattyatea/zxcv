-- Create full-text search virtual table for rules
CREATE VIRTUAL TABLE IF NOT EXISTS rules_fts USING fts5(
    rule_id,
    name,
    org,
    description,
    tags,
    content
);

-- Populate the FTS table with existing data
INSERT INTO rules_fts (rule_id, name, org, description, tags)
SELECT id, name, org, description, tags FROM rules;

-- Create triggers to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS rules_fts_insert AFTER INSERT ON rules
BEGIN
    INSERT INTO rules_fts (rule_id, name, org, description, tags)
    VALUES (new.id, new.name, new.org, new.description, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS rules_fts_update AFTER UPDATE ON rules
BEGIN
    UPDATE rules_fts SET
        name = new.name,
        org = new.org,
        description = new.description,
        tags = new.tags
    WHERE rule_id = new.id;
END;

CREATE TRIGGER IF NOT EXISTS rules_fts_delete AFTER DELETE ON rules
BEGIN
    DELETE FROM rules_fts WHERE rule_id = old.id;
END;