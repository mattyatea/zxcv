import { vi } from "vitest";

// Create a global mock Prisma client that will be used across all tests
const mockPrismaClient = {
	user: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		count: vi.fn(),
	},
	rule: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		count: vi.fn(),
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
		create: vi.fn(),
		update: vi.fn(),
		deleteMany: vi.fn(),
	},
	organizationMember: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		count: vi.fn(),
	},
	$transaction: vi.fn().mockImplementation((fn) => fn(mockPrismaClient)),
};

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