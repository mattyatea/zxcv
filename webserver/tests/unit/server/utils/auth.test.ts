import { describe, expect, it, vi, beforeEach } from "vitest";
import { createError } from "h3";
import {
	getAuthFromEvent,
	requireAuth,
	requireEmailVerification,
	requireScope,
} from "~/server/utils/auth";
import * as cryptoUtils from "~/server/utils/crypto";
import * as jwtUtils from "~/server/utils/jwt";
import * as prismaUtils from "~/server/utils/prisma";
import type { H3Event } from "h3";
import type { PrismaClient } from "@prisma/client";

// Mock dependencies
vi.mock("~/server/utils/crypto");
vi.mock("~/server/utils/jwt");
vi.mock("~/server/utils/prisma");
vi.mock("h3", () => ({
	createError: vi.fn((error) => new Error(error.statusMessage)),
	getHeader: vi.fn(),
}));

describe("auth utilities", () => {
	let mockEvent: H3Event;
	let mockPrisma: {
		apiKey: {
			findMany: ReturnType<typeof vi.fn>;
			update: ReturnType<typeof vi.fn>;
		};
	};

	beforeEach(() => {
		vi.clearAllMocks();

		// Setup mock Prisma client
		mockPrisma = {
			apiKey: {
				findMany: vi.fn(),
				update: vi.fn(),
			},
		};

		// Setup mock event
		mockEvent = {
			context: {
				cloudflare: {
					env: {
						DB: {} as any,
						JWT_SECRET: "test-secret",
					},
				},
			},
		} as any;

		// Setup default mocks
		vi.mocked(prismaUtils.createPrismaClient).mockReturnValue(mockPrisma as any);
		vi.mocked(cryptoUtils.verifyPassword).mockResolvedValue(false);
		vi.mocked(jwtUtils.verifyJWT).mockResolvedValue(null);
	});

	describe("getAuthFromEvent", () => {
		it("should return empty auth context when no authentication is provided", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockReturnValue(undefined);

			const result = await getAuthFromEvent(mockEvent);

			expect(result).toEqual({});
			expect(getHeader).toHaveBeenCalledWith(mockEvent, "x-api-key");
			expect(getHeader).toHaveBeenCalledWith(mockEvent, "authorization");
		});

		it("should authenticate with API key", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockImplementation((_, header) => {
				if (header === "x-api-key") return "test-api-key";
				return undefined;
			});

			const mockApiKey = {
				id: "key_123",
				keyHash: "hashed_key",
				scopes: JSON.stringify(["read:rules", "write:rules"]),
				user: {
					id: "user_123",
					email: "test@example.com",
					username: "testuser",
					emailVerified: true,
					displayName: null,
					avatarUrl: null,
				},
			};

			mockPrisma.apiKey.findMany.mockResolvedValue([mockApiKey]);
			vi.mocked(cryptoUtils.verifyPassword).mockResolvedValue(true);

			const result = await getAuthFromEvent(mockEvent);

			expect(result.user).toEqual({
				id: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
				displayName: null,
				avatarUrl: null,
			});
			expect(result.apiKeyScopes).toEqual(["read:rules", "write:rules"]);
			expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
				where: { id: "key_123" },
				data: { lastUsedAt: expect.any(Number) },
			});
		});

		it("should authenticate with JWT token", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockImplementation((_, header) => {
				if (header === "authorization") return "Bearer test-jwt-token";
				return undefined;
			});

			vi.mocked(jwtUtils.verifyJWT).mockResolvedValue({
				sub: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
				displayName: null,
				avatarUrl: null,
			});

			const result = await getAuthFromEvent(mockEvent);

			expect(result.user).toEqual({
				id: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
				displayName: null,
				avatarUrl: null,
			});
			expect(result.apiKeyScopes).toBeUndefined();
			expect(jwtUtils.verifyJWT).toHaveBeenCalledWith(
				"test-jwt-token",
				mockEvent.context.cloudflare.env,
			);
		});

		it("should prioritize API key over JWT when both are provided", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockImplementation((_, header) => {
				if (header === "x-api-key") return "test-api-key";
				if (header === "authorization") return "Bearer test-jwt-token";
				return undefined;
			});

			const mockApiKey = {
				id: "key_123",
				keyHash: "hashed_key",
				scopes: JSON.stringify(["read:rules"]),
				user: {
					id: "user_123",
					email: "test@example.com",
					username: "testuser",
					emailVerified: true,
					displayName: null,
					avatarUrl: null,
				},
			};

			mockPrisma.apiKey.findMany.mockResolvedValue([mockApiKey]);
			vi.mocked(cryptoUtils.verifyPassword).mockResolvedValue(true);

			const result = await getAuthFromEvent(mockEvent);

			expect(result.user?.id).toBe("user_123");
			expect(result.apiKeyScopes).toEqual(["read:rules"]);
			expect(jwtUtils.verifyJWT).not.toHaveBeenCalled();
		});

		it("should handle expired API keys", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockImplementation((_, header) => {
				if (header === "x-api-key") return "test-api-key";
				return undefined;
			});

			const expiredKey = {
				id: "key_123",
				keyHash: "hashed_key",
				expiresAt: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
				user: { id: "user_123" },
			};

			mockPrisma.apiKey.findMany.mockResolvedValue([]);

			const result = await getAuthFromEvent(mockEvent);

			expect(result).toEqual({});
			expect(cryptoUtils.verifyPassword).not.toHaveBeenCalled();
		});

		it("should handle API key with null scopes", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockImplementation((_, header) => {
				if (header === "x-api-key") return "test-api-key";
				return undefined;
			});

			const mockApiKey = {
				id: "key_123",
				keyHash: "hashed_key",
				scopes: null,
				user: {
					id: "user_123",
					email: "test@example.com",
					username: "testuser",
					emailVerified: false,
					displayName: null,
					avatarUrl: null,
				},
			};

			mockPrisma.apiKey.findMany.mockResolvedValue([mockApiKey]);
			vi.mocked(cryptoUtils.verifyPassword).mockResolvedValue(true);

			const result = await getAuthFromEvent(mockEvent);

			expect(result.user).toBeDefined();
			expect(result.apiKeyScopes).toEqual([]);
		});
	});

	describe("requireAuth", () => {
		it("should return user when authenticated", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockImplementation((_, header) => {
				if (header === "authorization") return "Bearer test-jwt-token";
				return undefined;
			});

			vi.mocked(jwtUtils.verifyJWT).mockResolvedValue({
				sub: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
				displayName: null,
				avatarUrl: null,
			});

			const result = await requireAuth(mockEvent);

			expect(result).toEqual({
				id: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
				displayName: null,
				avatarUrl: null,
			});
		});

		it("should throw 401 error when not authenticated", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockReturnValue(undefined);

			await expect(requireAuth(mockEvent)).rejects.toThrow("Authentication required");
			expect(createError).toHaveBeenCalledWith({
				statusCode: 401,
				statusMessage: "Authentication required",
			});
		});
	});

	describe("requireEmailVerification", () => {
		it("should return user when email is verified", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockImplementation((_, header) => {
				if (header === "authorization") return "Bearer test-jwt-token";
				return undefined;
			});

			vi.mocked(jwtUtils.verifyJWT).mockResolvedValue({
				sub: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
				displayName: null,
				avatarUrl: null,
			});

			const result = await requireEmailVerification(mockEvent);

			expect(result).toEqual({
				id: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
				displayName: null,
				avatarUrl: null,
			});
		});

		it("should throw 403 error when email is not verified", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockImplementation((_, header) => {
				if (header === "authorization") return "Bearer test-jwt-token";
				return undefined;
			});

			vi.mocked(jwtUtils.verifyJWT).mockResolvedValue({
				sub: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: false,
				displayName: null,
				avatarUrl: null,
			});

			await expect(requireEmailVerification(mockEvent)).rejects.toThrow(
				"Email verification required. Please verify your email address to access this resource.",
			);
			expect(createError).toHaveBeenCalledWith({
				statusCode: 403,
				statusMessage:
					"Email verification required. Please verify your email address to access this resource.",
			});
		});

		it("should throw 401 error when not authenticated", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockReturnValue(undefined);

			await expect(requireEmailVerification(mockEvent)).rejects.toThrow("Authentication required");
		});
	});

	describe("requireScope", () => {
		it("should allow access with JWT authentication (full access)", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockImplementation((_, header) => {
				if (header === "authorization") return "Bearer test-jwt-token";
				return undefined;
			});

			vi.mocked(jwtUtils.verifyJWT).mockResolvedValue({
				sub: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
				displayName: null,
				avatarUrl: null,
			});

			await expect(requireScope(mockEvent, "write:rules")).resolves.toBeUndefined();
		});

		it("should allow access with API key having required scope", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockImplementation((_, header) => {
				if (header === "x-api-key") return "test-api-key";
				return undefined;
			});

			const mockApiKey = {
				id: "key_123",
				keyHash: "hashed_key",
				scopes: JSON.stringify(["read:rules", "write:rules"]),
				user: {
					id: "user_123",
					email: "test@example.com",
					username: "testuser",
					emailVerified: true,
					displayName: null,
					avatarUrl: null,
				},
			};

			mockPrisma.apiKey.findMany.mockResolvedValue([mockApiKey]);
			vi.mocked(cryptoUtils.verifyPassword).mockResolvedValue(true);

			await expect(requireScope(mockEvent, "write:rules")).resolves.toBeUndefined();
		});

		it("should throw 403 error when API key lacks required scope", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockImplementation((_, header) => {
				if (header === "x-api-key") return "test-api-key";
				return undefined;
			});

			const mockApiKey = {
				id: "key_123",
				keyHash: "hashed_key",
				scopes: JSON.stringify(["read:rules"]),
				user: {
					id: "user_123",
					email: "test@example.com",
					username: "testuser",
					emailVerified: true,
					displayName: null,
					avatarUrl: null,
				},
			};

			mockPrisma.apiKey.findMany.mockResolvedValue([mockApiKey]);
			vi.mocked(cryptoUtils.verifyPassword).mockResolvedValue(true);

			await expect(requireScope(mockEvent, "write:rules")).rejects.toThrow("Insufficient scope");
			expect(createError).toHaveBeenCalledWith({
				statusCode: 403,
				statusMessage: "Insufficient scope",
			});
		});

		it("should throw 401 error when not authenticated", async () => {
			const { getHeader } = await import("h3");
			vi.mocked(getHeader).mockReturnValue(undefined);

			await expect(requireScope(mockEvent, "read:rules")).rejects.toThrow(
				"Authentication required",
			);
		});
	});
});