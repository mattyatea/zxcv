// @ts-ignore - Type import issues
import type { ExecutionContext, IncomingRequest } from "@cloudflare/workers-types";
import type { Context } from "~/server/orpc/types";

// Helper to create mock request
export function createMockRequest(
	overrides: Partial<{
		method: string;
		url: string;
		headers: Record<string, string>;
		body: any;
	}> = {},
): IncomingRequest {
	const defaultHeaders = new Headers({
		"content-type": "application/json",
		...overrides.headers,
	});

	const request = new Request(overrides.url || "http://localhost:3000/api", {
		method: overrides.method || "POST",
		headers: defaultHeaders,
		body: overrides.body ? JSON.stringify(overrides.body) : undefined,
	}) as IncomingRequest;

	return request;
}

// Helper to create mock execution context
export function createMockExecutionContext(): ExecutionContext {
	return {
		waitUntil: vi.fn(),
		passThroughOnException: vi.fn(),
		// @ts-ignore - props is optional
		props: {},
	} as ExecutionContext;
}

// Helper to create mock Cloudflare environment
export function createMockEnv(overrides: Partial<any> = {}): any {
	return {
		DB: {} as any,
		ZXCV_DB: {} as any,
		ZXCV_R2: {} as any,
		JWT_SECRET: "test-jwt-secret",
		JWT_ALGORITHM: "HS256",
		JWT_EXPIRES_IN: "1h",
		REFRESH_TOKEN_EXPIRES_IN: "7d",
		EMAIL_FROM: "test@example.com",
		FRONTEND_URL: "http://localhost:3000",
		EMAIL_SEND: {
			send: vi.fn().mockResolvedValue({ success: true }),
		} as any,
		GITHUB_CLIENT_ID: "test-github-client-id",
		GITHUB_CLIENT_SECRET: "test-github-client-secret",
		GOOGLE_CLIENT_ID: "test-google-client-id",
		GOOGLE_CLIENT_SECRET: "test-google-client-secret",
		R2: {
			put: vi.fn(),
			get: vi.fn(),
			delete: vi.fn(),
		} as any,
		...overrides,
	};
}

// Helper to create mock oRPC context
export function createMockContext(overrides: Partial<Context> = {}): Context {
	const env = overrides.env || createMockEnv();
	const db = overrides.db || ({} as any);

	return {
		env,
		db,
		user: null as any,
		request: (overrides as any).request || createMockRequest(),
		executionContext: (overrides as any).executionContext || createMockExecutionContext(),
		cloudflare: {
			env,
			context: createMockExecutionContext(),
			request: createMockRequest({
				headers: {
					"CF-Connecting-IP": "127.0.0.1",
					"X-Forwarded-For": "127.0.0.1",
				},
			}),
		},
		...overrides,
	} as any;
}

// Helper to create authenticated context
export function createAuthenticatedContext(
	user: { id: string; email: string; username: string; emailVerified?: boolean },
	overrides: Partial<Context> = {},
): Context {
	return createMockContext({
		...overrides,
		user: { ...user, emailVerified: user.emailVerified ?? true } as any,
	});
}

// Helper to mock R2 object
export function createMockR2Object(content: string = "# Test Rule Content") {
	return {
		body: {
			text: vi.fn().mockResolvedValue(content),
			json: vi.fn().mockResolvedValue(JSON.parse(content)),
			arrayBuffer: vi.fn().mockResolvedValue(new TextEncoder().encode(content).buffer),
		},
		bodyUsed: false,
		key: "test-key",
		version: "test-version",
		size: content.length,
		etag: "test-etag",
		httpEtag: "test-http-etag",
		uploaded: new Date(),
		httpMetadata: {},
		customMetadata: {},
		writeHttpMetadata: vi.fn(),
	};
}

// Helper to mock R2 bucket
export function createMockR2Bucket() {
	const storage = new Map<string, any>();

	return {
		put: vi.fn().mockImplementation(async (key: string, value: any) => {
			storage.set(key, value);
			return createMockR2Object(value);
		}),
		get: vi.fn().mockImplementation(async (key: string) => {
			const value = storage.get(key);
			return value ? createMockR2Object(value) : null;
		}),
		delete: vi.fn().mockImplementation(async (key: string) => {
			storage.delete(key);
		}),
		list: vi.fn().mockResolvedValue({
			objects: Array.from(storage.keys()).map((key) => ({
				key,
				size: 100,
				uploaded: new Date(),
			})),
			truncated: false,
		}),
		head: vi.fn().mockImplementation(async (key: string) => {
			return storage.has(key) ? createMockR2Object() : null;
		}),
	};
}

// Helper to mock email sending
export function createMockEmailSender() {
	const sentEmails: Array<{ to: string; subject: string; body: string }> = [];

	return {
		send: vi.fn().mockImplementation(async (email: any) => {
			sentEmails.push({
				to: email.to?.[0]?.email || email.to,
				subject: email.subject,
				body: email.body || email.text || "",
			});
			return { success: true };
		}),
		getSentEmails: () => sentEmails,
		clearSentEmails: () => {
			sentEmails.length = 0;
		},
	};
}

// Helper to mock JWT functions
export function mockJWT() {
	return {
		generateToken: vi.fn().mockReturnValue("mock-jwt-token"),
		verifyToken: vi.fn().mockResolvedValue({
			id: "user_123",
			email: "test@example.com",
			username: "testuser",
		}),
	};
}

// Helper to mock password hashing
export function mockCrypto() {
	return {
		hashPassword: vi.fn().mockResolvedValue("hashed_password"),
		verifyPassword: vi.fn().mockResolvedValue(true),
	};
}