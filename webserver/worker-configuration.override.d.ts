/* eslint-disable */
// Override auto-generated types for secrets
// Secrets are provided at runtime via wrangler secret, not from wrangler.toml
declare namespace Cloudflare {
	interface Env {
		JWT_SECRET: string;
		GOOGLE_CLIENT_ID: string;
		GOOGLE_CLIENT_SECRET: string;
		GH_OAUTH_CLIENT_ID: string;
		GH_OAUTH_CLIENT_SECRET: string;
	}
}
