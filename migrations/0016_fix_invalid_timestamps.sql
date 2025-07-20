-- Fix invalid timestamp values in users table
-- This migration fixes users with invalid created_at or updated_at values

-- Update any users with invalid created_at values (non-integer or empty objects)
UPDATE users 
SET created_at = strftime('%s', 'now')
WHERE typeof(created_at) != 'integer' 
   OR created_at IS NULL 
   OR created_at = ''
   OR created_at = '{}';

-- Update any users with invalid updated_at values
UPDATE users 
SET updated_at = strftime('%s', 'now')
WHERE typeof(updated_at) != 'integer' 
   OR updated_at IS NULL 
   OR updated_at = ''
   OR updated_at = '{}';

-- Also fix any other tables that might have similar issues
UPDATE oauth_accounts 
SET created_at = strftime('%s', 'now')
WHERE typeof(created_at) != 'integer' 
   OR created_at IS NULL 
   OR created_at = ''
   OR created_at = '{}';

UPDATE oauth_accounts 
SET updated_at = strftime('%s', 'now')
WHERE typeof(updated_at) != 'integer' 
   OR updated_at IS NULL 
   OR updated_at = ''
   OR updated_at = '{}';