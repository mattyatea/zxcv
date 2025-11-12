-- Add user profile fields
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN location TEXT;
ALTER TABLE users ADD COLUMN website TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;