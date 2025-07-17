import type { Context, Next } from "hono";

export interface SecurityOptions {
	contentSecurityPolicy?: string;
	crossOriginEmbedderPolicy?: string;
	crossOriginOpenerPolicy?: string;
	crossOriginResourcePolicy?: string;
	originAgentCluster?: string;
	referrerPolicy?: string;
	strictTransportSecurity?: string;
	xContentTypeOptions?: string;
	xDNSPrefetchControl?: string;
	xDownloadOptions?: string;
	xFrameOptions?: string;
	xPermittedCrossDomainPolicies?: string;
	xXSSProtection?: string;
}

const defaultOptions: SecurityOptions = {
	contentSecurityPolicy:
		"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
	crossOriginEmbedderPolicy: "require-corp",
	crossOriginOpenerPolicy: "same-origin",
	crossOriginResourcePolicy: "cross-origin",
	originAgentCluster: "?1",
	referrerPolicy: "strict-origin-when-cross-origin",
	strictTransportSecurity: "max-age=31536000; includeSubDomains",
	xContentTypeOptions: "nosniff",
	xDNSPrefetchControl: "off",
	xDownloadOptions: "noopen",
	xFrameOptions: "SAMEORIGIN",
	xPermittedCrossDomainPolicies: "none",
	xXSSProtection: "1; mode=block",
};

export function securityHeaders(options: SecurityOptions = {}) {
	const config = { ...defaultOptions, ...options };

	return async (c: Context, next: Next) => {
		// Set security headers
		if (config.contentSecurityPolicy) {
			c.header("Content-Security-Policy", config.contentSecurityPolicy);
		}

		if (config.crossOriginEmbedderPolicy) {
			c.header("Cross-Origin-Embedder-Policy", config.crossOriginEmbedderPolicy);
		}

		if (config.crossOriginOpenerPolicy) {
			c.header("Cross-Origin-Opener-Policy", config.crossOriginOpenerPolicy);
		}

		if (config.crossOriginResourcePolicy) {
			c.header("Cross-Origin-Resource-Policy", config.crossOriginResourcePolicy);
		}

		if (config.originAgentCluster) {
			c.header("Origin-Agent-Cluster", config.originAgentCluster);
		}

		if (config.referrerPolicy) {
			c.header("Referrer-Policy", config.referrerPolicy);
		}

		if (config.strictTransportSecurity) {
			c.header("Strict-Transport-Security", config.strictTransportSecurity);
		}

		if (config.xContentTypeOptions) {
			c.header("X-Content-Type-Options", config.xContentTypeOptions);
		}

		if (config.xDNSPrefetchControl) {
			c.header("X-DNS-Prefetch-Control", config.xDNSPrefetchControl);
		}

		if (config.xDownloadOptions) {
			c.header("X-Download-Options", config.xDownloadOptions);
		}

		if (config.xFrameOptions) {
			c.header("X-Frame-Options", config.xFrameOptions);
		}

		if (config.xPermittedCrossDomainPolicies) {
			c.header("X-Permitted-Cross-Domain-Policies", config.xPermittedCrossDomainPolicies);
		}

		if (config.xXSSProtection) {
			c.header("X-XSS-Protection", config.xXSSProtection);
		}

		// Add additional security headers
		c.header("X-Powered-By", ""); // Remove X-Powered-By header
		c.header("Server", ""); // Remove Server header

		await next();
	};
}

// CORS middleware with security considerations
export function corsMiddleware(allowedOrigins: string[] = []) {
	return async (c: Context, next: Next) => {
		const origin = c.req.header("Origin");
		const method = c.req.method;

		// Handle preflight requests
		if (method === "OPTIONS") {
			if (origin && allowedOrigins.includes(origin)) {
				c.header("Access-Control-Allow-Origin", origin);
			}
			c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
			c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
			c.header("Access-Control-Max-Age", "86400"); // 24 hours
			return c.json({}, 200);
		}

		// Handle actual requests
		if (origin && allowedOrigins.includes(origin)) {
			c.header("Access-Control-Allow-Origin", origin);
		}

		c.header("Access-Control-Allow-Credentials", "true");
		c.header("Vary", "Origin");

		await next();
	};
}

// Input validation middleware
export function inputValidationMiddleware() {
	return async (c: Context, next: Next) => {
		const contentType = c.req.header("content-type");
		const contentLength = c.req.header("content-length");

		// Validate content type for POST/PUT requests with body
		if (["POST", "PUT", "PATCH"].includes(c.req.method)) {
			// Only validate if there's actually a body
			const body = await c.req.raw.clone().text();
			if (body && body.length > 0) {
				if (!contentType || !contentType.includes("application/json")) {
					return c.json(
						{
							success: false,
							errors: [{ code: 1002, message: "Content-Type must be application/json" }],
						},
						400,
					);
				}
			}
		}

		// Validate content length
		if (contentLength && Number.parseInt(contentLength) > 10 * 1024 * 1024) {
			// 10MB limit
			return c.json(
				{
					success: false,
					errors: [{ code: 1003, message: "Request entity too large" }],
				},
				413,
			);
		}

		await next();
	};
}

// Request ID middleware
export function requestIdMiddleware() {
	return async (c: Context, next: Next) => {
		const requestId = c.req.header("x-request-id") || crypto.randomUUID();
		c.header("x-request-id", requestId);
		c.set("requestId", requestId);

		await next();
	};
}
