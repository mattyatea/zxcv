import type { PrismaClient } from "@prisma/client";
import { vi } from "vitest";

// Create a fully mocked Prisma client
export function createMockPrismaClient(): PrismaClient {
	const mockDb = {
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
		organization: {
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
		organizationMember: {
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
			count: vi.fn().mockResolvedValue(0),
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
			count: vi.fn().mockResolvedValue(0),
		},
		emailVerification: {
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
		},
		passwordReset: {
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
		},
		apiKey: {
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
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
		},
		$transaction: vi.fn().mockImplementation((callback) => {
			// Simple transaction mock that just executes the callback
			if (typeof callback === "function") {
				return callback(mockDb);
			}
			// For array of promises
			return Promise.all(callback);
		}),
		$connect: vi.fn().mockResolvedValue(undefined),
		$disconnect: vi.fn().mockResolvedValue(undefined),
		$on: vi.fn(),
		$use: vi.fn(),
		team: {
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
			count: vi.fn().mockResolvedValue(0),
		},
		teamMember: {
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
			count: vi.fn().mockResolvedValue(0),
		},
		ruleVersion: {
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
			count: vi.fn().mockResolvedValue(0),
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
			count: vi.fn().mockResolvedValue(0),
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
			count: vi.fn().mockResolvedValue(0),
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
			count: vi.fn().mockResolvedValue(0),
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
			count: vi.fn().mockResolvedValue(0),
		},
		oAuthTempRegistration: {
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
			count: vi.fn().mockResolvedValue(0),
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
			count: vi.fn().mockResolvedValue(0),
		},
		tag: {
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
			count: vi.fn().mockResolvedValue(0),
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
			count: vi.fn().mockResolvedValue(0),
		},
		$extends: vi.fn().mockReturnThis(),
		$executeRaw: vi.fn(),
		$executeRawUnsafe: vi.fn(),
		$queryRaw: vi.fn(),
		$queryRawUnsafe: vi.fn(),
	} as unknown as PrismaClient;

	return mockDb;
}

// Helper to set up common mock responses
export function setupCommonMocks(mockDb: ReturnType<typeof createMockPrismaClient>) {
	// Mock organization.findUnique to return null by default (no organization with username)
	// biome-ignore lint/suspicious/noExplicitAny: Type casting needed to access mock function methods
	(mockDb.organization.findUnique as any).mockResolvedValue(null);

	// Mock user counts to return 0 by default
	// biome-ignore lint/suspicious/noExplicitAny: Type casting needed to access mock function methods
	(mockDb.rule.count as any).mockResolvedValue(0);
	// biome-ignore lint/suspicious/noExplicitAny: Type casting needed to access mock function methods
	(mockDb.organizationMember.count as any).mockResolvedValue(0);

	// Mock oAuthState.deleteMany to return count
	// biome-ignore lint/suspicious/noExplicitAny: Type casting needed to access mock function methods
	(mockDb.oAuthState.deleteMany as any).mockResolvedValue({ count: 0 });
}
