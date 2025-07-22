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
	$transaction: vi.fn().mockImplementation((fn) => fn(mockPrismaClient)),
};

// Setup default mock behaviors
mockPrismaClient.user.create.mockImplementation(async (args) => {
	const data = args?.data || {};
	return {
		id: data.id || `user_${Date.now()}`,
		username: data.username || "testuser",
		email: data.email || "test@example.com",
		passwordHash: data.passwordHash || "hashed",
		emailVerified: data.emailVerified || false,
		createdAt: Math.floor(Date.now() / 1000),
		updatedAt: Math.floor(Date.now() / 1000),
	};
});

mockPrismaClient.user.findUnique.mockImplementation(async (args) => {
	// Return null by default (user not found)
	return null;
});

mockPrismaClient.user.findFirst.mockImplementation(async (args) => {
	// Return null by default (user not found)
	return null;
});

// Mock the createPrismaClient function globally
vi.mock("~/server/utils/prisma", () => ({
	createPrismaClient: vi.fn(() => {
		console.log("[MOCK] createPrismaClient called, returning mock");
		return mockPrismaClient;
	}),
}));

// Export the mock for tests to use
(globalThis as any).__mockPrismaClient = mockPrismaClient;
console.log("[SETUP] Global mock Prisma client created");