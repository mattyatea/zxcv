import { vi } from "vitest";

// Create a global mock Prisma client that will be used across all tests
const mockPrismaClient = {
	user: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
		aggregate: vi.fn(),
		groupBy: vi.fn(),
	},
	rule: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
		aggregate: vi.fn(),
		groupBy: vi.fn(),
	},
	ruleVersion: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
	},
	ruleLike: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		delete: vi.fn(),
		count: vi.fn(),
	},
	ruleView: {
		findFirst: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		count: vi.fn(),
		groupBy: vi.fn(),
	},
	// @ts-ignore - These models might not exist in all Prisma schemas
	team: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	// @ts-ignore - These models might not exist in all Prisma schemas
	teamMember: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	organization: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	emailVerification: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
	},
	passwordReset: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
	},
	apiKey: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	rateLimit: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		upsert: vi.fn(),
		count: vi.fn(),
	},
	organizationMember: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
	},
	ruleStar: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
	},
	ruleDownload: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
	},
	task: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
	},
	oAuthAccount: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
	},
	oAuthState: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
	},
	organizationInvitation: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
	},
	tag: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn().mockResolvedValue([]), // Default to empty array for tags
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
	},
	ruleTag: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
	},
	$transaction: vi.fn().mockImplementation((fn) => fn(mockPrismaClient)),
	$queryRaw: vi.fn(),
	$queryRawUnsafe: vi.fn(),
	$executeRaw: vi.fn(),
	$executeRawUnsafe: vi.fn(),
};

// Setup default mock behaviors - Use mockResolvedValue instead of mockImplementation
mockPrismaClient.user.create.mockImplementation(async (args) => {
	const data = args?.data || {};
	const result = {
		id: data.id || `user_${Date.now()}`,
		username: data.username || "testuser",
		email: data.email || "test@example.com",
		passwordHash: data.passwordHash || "hashed",
		emailVerified: data.emailVerified ?? false,
		createdAt: Math.floor(Date.now() / 1000),
		updatedAt: Math.floor(Date.now() / 1000),
		name: null,
		avatarUrl: null,
		bio: null,
		website: null,
		location: null,
		company: null,
		twitterUsername: null,
		githubUsername: null,
	};
	console.log("[MOCK] user.create called with:", data);
	console.log("[MOCK] user.create returning:", result);
	return result;
});

mockPrismaClient.user.findUnique.mockImplementation(async (_args) => {
	// Return null by default (user not found)
	return null;
});

mockPrismaClient.user.findFirst.mockImplementation(async (_args) => {
	// Return null by default (user not found)
	return null;
});

// Setup default behaviors for rule model
mockPrismaClient.rule.create.mockImplementation(async (args) => {
	const data = args?.data || {};
	const result = {
		id: data.id || `rule_${Date.now()}`,
		name: data.name || "test-rule",
		organizationId: data.organizationId || null,
		userId: data.userId || "user_123",
		visibility: data.visibility || "public",
		description: data.description || null,
		readme: data.readme || null,
		tags: data.tags || null,
		version: data.version || "1.0",
		latestVersionId: data.latestVersionId || null,
		createdAt: data.createdAt || Math.floor(Date.now() / 1000),
		updatedAt: data.updatedAt || Math.floor(Date.now() / 1000),
	};
	console.log("[MOCK] rule.create called with:", data);
	console.log("[MOCK] rule.create returning:", result);
	return result;
});

// Setup default behaviors for ruleVersion model
mockPrismaClient.ruleVersion.create.mockImplementation(async (args) => {
	const data = args?.data || {};
	return {
		id: data.id || `version_${Date.now()}`,
		ruleId: data.ruleId || "rule_123",
		version: data.version || 1,
		changelog: data.changelog || null,
		createdAt: Math.floor(Date.now() / 1000),
	};
});

// Export the mock for tests to use BEFORE setting up the mock
(globalThis as any).__mockPrismaClient = mockPrismaClient;
console.log("[SETUP] Global mock Prisma client created");

// Mock the createPrismaClient function globally
vi.mock("~/server/utils/prisma", () => ({
	createPrismaClient: vi.fn((_db: any) => {
		console.log("[MOCK] createPrismaClient called, returning mock");
		const mockClient = (globalThis as any).__mockPrismaClient;
		console.log("[MOCK] Mock client user.create exists:", !!mockClient?.user?.create);
		console.log("[MOCK] Mock client user.create type:", typeof mockClient?.user?.create);
		// Use the global mock client
		return mockClient;
	}),
}));

// Mock crypto utilities globally
vi.mock("~/server/utils/crypto", () => ({
	generateId: vi.fn(() => `id_${Date.now()}`),
	hashPassword: vi.fn(async (password: string) => `hashed_${password}`),
	verifyPassword: vi.fn(async (_password: string, _hash: string) => true),
}));

// Mock OAuth security utilities globally
vi.mock("~/server/utils/oauthSecurity", () => ({
	validateRedirectUrl: vi.fn((url) => {
		// Allow relative URLs that start with /
		if (url?.startsWith("/") && !url.startsWith("//")) {
			return true;
		}
		// For tests, allow all localhost URLs
		return true;
	}),
	performOAuthSecurityChecks: vi.fn().mockResolvedValue(undefined),
	generateNonce: vi.fn().mockReturnValue("test-nonce"),
	validateOAuthResponse: vi.fn(),
	OAUTH_CONFIG: {
		STATE_EXPIRATION: 600,
		MAX_PENDING_STATES_PER_IP: 5,
		OAUTH_RATE_LIMIT: {
			windowMs: 900 * 1000,
			maxRequests: 10,
		},
	},
}));
