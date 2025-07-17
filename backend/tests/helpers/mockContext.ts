import { vi } from "vitest";

export function createMockContext() {
	const mockPrisma = {
		rateLimit: {
			findFirst: vi.fn(),
			upsert: vi.fn(),
			update: vi.fn(),
		},
		user: {
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
		},
		rule: {
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
		ruleVersion: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
		},
		team: {
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
		},
		teamMember: {
			findUnique: vi.fn(),
			findMany: vi.fn(),
			create: vi.fn(),
			delete: vi.fn(),
		},
	};

	return {
		env: {
			DB: {} as any,
			RATE_LIMIT_AUTHENTICATED: "1000",
			RATE_LIMIT_ANONYMOUS: "100",
			JWT_SECRET: "test-secret",
		},
		get: vi.fn().mockReturnValue(null), // Default to no user
		header: vi.fn(),
		json: vi.fn(),
		req: {
			header: vi.fn().mockReturnValue("192.168.1.1"),
			path: "/test",
		},
		mockPrisma,
	};
}

export function createMockUser(overrides: any = {}) {
	return {
		id: "user-123",
		email: "test@example.com",
		username: "testuser",
		passwordHash: "hashed-password",
		settings: "{}",
		createdAt: 1234567890,
		updatedAt: 1234567890,
		...overrides,
	};
}

export function createMockRule(overrides: any = {}) {
	return {
		id: "rule-123",
		name: "test-rule",
		org: null,
		userId: "user-123",
		visibility: "public",
		description: "Test rule",
		tags: null,
		createdAt: 1234567890,
		updatedAt: 1234567890,
		publishedAt: 1234567890,
		version: "1.0.0",
		latestVersionId: "version-123",
		downloads: 0,
		stars: 0,
		teamId: null,
		...overrides,
	};
}

export function createMockRuleVersion(overrides: any = {}) {
	return {
		id: "version-123",
		ruleId: "rule-123",
		versionNumber: "1.0.0",
		changelog: "Initial version",
		contentHash: "hash-123",
		r2ObjectKey: "rules/rule-123/1.0.0.md",
		createdAt: 1234567890,
		createdBy: "user-123",
		...overrides,
	};
}

export function createMockTeam(overrides: any = {}) {
	return {
		id: "team-123",
		name: "test-team",
		displayName: "Test Team",
		description: "Test team description",
		ownerId: "user-123",
		createdAt: 1234567890,
		updatedAt: 1234567890,
		...overrides,
	};
}