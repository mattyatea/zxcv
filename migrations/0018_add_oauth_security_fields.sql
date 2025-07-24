-- Add client IP tracking to OAuth state table for security
ALTER TABLE oauth_states ADD COLUMN client_ip TEXT;

-- Add index for IP-based queries
CREATE INDEX idx_oauth_states_client_ip ON oauth_states(client_ip);

-- Add nonce field for additional CSRF protection
ALTER TABLE oauth_states ADD COLUMN nonce TEXT;

-- Add attempt count for rate limiting per state
ALTER TABLE oauth_states ADD COLUMN attempt_count INTEGER DEFAULT 0;