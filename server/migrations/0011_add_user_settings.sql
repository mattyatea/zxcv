-- Add settings column to users table
ALTER TABLE users ADD COLUMN settings TEXT DEFAULT '{}';