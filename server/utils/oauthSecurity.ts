import { ORPCError } from "@orpc/server";
import type { Locale } from "./i18n";
import { authErrors } from "./i18n";

// OAuth security configuration
export const OAUTH_CONFIG = {
	// State expiration time in seconds (10 minutes)
	STATE_EXPIRATION: 600,
	// Maximum number of pending states per IP
	MAX_PENDING_STATES_PER_IP: 5,
	// Rate limit for OAuth operations
	OAUTH_RATE_LIMIT: {
		windowMs: 900 * 1000, // 15 minutes
		maxRequests: 10,
	},
} as const;

/**
 * Validate OAuth redirect URL to prevent open redirect vulnerabilities
 */
export function validateRedirectUrl(url: string, allowedDomains: string[]): boolean {
	try {
		const parsedUrl = new URL(url);

		// Allow relative URLs
		if (url.startsWith("/") && !url.startsWith("//")) {
			return true;
		}

		// Check against allowed domains
		return allowedDomains.some((domain) => {
			if (domain.startsWith("*.")) {
				// Wildcard subdomain matching
				const baseDomain = domain.slice(2);
				return parsedUrl.hostname === baseDomain || parsedUrl.hostname.endsWith(`.${baseDomain}`);
			}
			return parsedUrl.hostname === domain;
		});
	} catch {
		// Invalid URL
		return false;
	}
}

/**
 * Additional security checks for OAuth state
 */
export async function performOAuthSecurityChecks(
	db: any,
	clientIp: string,
	locale: Locale = "ja",
): Promise<void> {
	// Check for too many pending states from the same IP
	const pendingStatesCount = await db.oAuthState.count({
		where: {
			clientIp,
			expiresAt: {
				gte: Math.floor(Date.now() / 1000),
			},
		},
	});

	if (pendingStatesCount >= OAUTH_CONFIG.MAX_PENDING_STATES_PER_IP) {
		throw new ORPCError("TOO_MANY_REQUESTS", {
			message: authErrors.tooManyOAuthAttempts(locale),
		});
	}
}

/**
 * Generate secure nonce for additional CSRF protection
 */
export function generateNonce(): string {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate OAuth response parameters for additional security
 */
export function validateOAuthResponse(params: {
	code?: string;
	state?: string;
	error?: string;
	error_description?: string;
}): void {
	// Check for OAuth errors
	if (params.error) {
		const errorMessages: Record<string, string> = {
			access_denied: "ユーザーがアクセスを拒否しました",
			invalid_request: "無効なリクエストです",
			unauthorized_client: "認証されていないクライアントです",
			unsupported_response_type: "サポートされていないレスポンスタイプです",
			invalid_scope: "無効なスコープです",
			server_error: "認証サーバーでエラーが発生しました",
			temporarily_unavailable: "一時的に利用できません",
		};

		throw new ORPCError("BAD_REQUEST", {
			message: errorMessages[params.error] || params.error_description || "OAuth認証に失敗しました",
		});
	}

	// Validate required parameters
	if (!params.code || !params.state) {
		throw new ORPCError("BAD_REQUEST", {
			message: "必要なパラメータが不足しています",
		});
	}

	// Basic validation for code and state format
	if (params.code.length < 10 || params.code.length > 1024) {
		throw new ORPCError("BAD_REQUEST", {
			message: "無効な認証コードです",
		});
	}

	if (params.state.length < 10 || params.state.length > 1024) {
		throw new ORPCError("BAD_REQUEST", {
			message: "無効なstateパラメータです",
		});
	}
}
