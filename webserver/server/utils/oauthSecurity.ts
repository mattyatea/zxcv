import { ORPCError } from "@orpc/server";
import { authErrors, t } from "./i18n";
import type { Locale } from "./locale";

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
	// biome-ignore lint/suspicious/noExplicitAny: Database client type is dynamically provided by context
	db: any,
	clientIp: string,
	locale: Locale = "ja",
): Promise<void> {
	// Check for too many pending states from the same IP
	const pendingStates = await db.oAuthState.findMany({
		where: {
			clientIp: clientIp,
			expiresAt: {
				gte: Math.floor(Date.now() / 1000),
			},
		},
	});
	const pendingStatesCount = pendingStates.length;

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
export function validateOAuthResponse(
	params: {
		code?: string;
		state?: string;
		error?: string;
		error_description?: string;
	},
	locale: Locale = "ja",
): void {
	// Check for OAuth errors
	if (params.error) {
		const errorKeyMap: Record<string, string> = {
			access_denied: "errors.oauth.accessDenied",
			invalid_request: "errors.oauth.invalidRequest",
			unauthorized_client: "errors.oauth.unauthorizedClient",
			unsupported_response_type: "errors.oauth.unsupportedResponseType",
			invalid_scope: "errors.oauth.invalidScope",
			server_error: "errors.oauth.serverError",
			temporarily_unavailable: "errors.oauth.temporarilyUnavailable",
		};

		const messageKey = errorKeyMap[params.error];
		const message = messageKey
			? t(messageKey, locale)
			: params.error_description || t("errors.oauth.authFailed", locale);

		throw new ORPCError("BAD_REQUEST", {
			message,
		});
	}

	// Validate required parameters
	if (!params.code || !params.state) {
		throw new ORPCError("BAD_REQUEST", {
			message: t("errors.oauth.missingParams", locale),
		});
	}

	// Basic validation for code and state format
	if (params.code.length < 10 || params.code.length > 1024) {
		throw new ORPCError("BAD_REQUEST", {
			message: t("errors.oauth.invalidCode", locale),
		});
	}

	if (params.state.length < 10 || params.state.length > 1024) {
		throw new ORPCError("BAD_REQUEST", {
			message: t("errors.oauth.invalidState", locale),
		});
	}
}
