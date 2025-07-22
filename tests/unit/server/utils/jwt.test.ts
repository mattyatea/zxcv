import { describe, expect, it, vi, beforeEach } from "vitest";
import { jwtVerify, SignJWT } from "jose";
import {
	createJWT,
	verifyJWT,
	createRefreshToken,
	verifyRefreshToken,
	generateToken,
} from "~/server/utils/jwt";
import type { Env } from "~/server/types/env";

// Mock jose
vi.mock("jose", () => ({
	SignJWT: vi.fn(),
	jwtVerify: vi.fn(),
}));

describe("JWT utilities", () => {
	let mockEnv: Env;
	let mockSignJWT: any;
	let mockJwtVerify: typeof jwtVerify;

	beforeEach(() => {
		vi.clearAllMocks();

		mockEnv = {
			JWT_SECRET: "test-secret",
			JWT_ALGORITHM: "HS256",
			JWT_EXPIRES_IN: "1h",
		} as Env;

		// Setup SignJWT mock chain
		mockSignJWT = {
			setProtectedHeader: vi.fn().mockReturnThis(),
			setIssuedAt: vi.fn().mockReturnThis(),
			setExpirationTime: vi.fn().mockReturnThis(),
			sign: vi.fn().mockResolvedValue("mock-jwt-token"),
		};

		vi.mocked(SignJWT).mockImplementation(() => mockSignJWT);
		mockJwtVerify = vi.mocked(jwtVerify) as any;
	});

	describe("createJWT", () => {
		it("should create a JWT token with correct payload", async () => {
			const payload = {
				sub: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
			};

			const result = await createJWT(payload, mockEnv);

			expect(result).toBe("mock-jwt-token");
			expect(SignJWT).toHaveBeenCalledWith(payload);
			expect(mockSignJWT.setProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
			expect(mockSignJWT.setIssuedAt).toHaveBeenCalled();
			expect(mockSignJWT.setExpirationTime).toHaveBeenCalledWith("1h");
			expect(mockSignJWT.sign).toHaveBeenCalledWith(
				new TextEncoder().encode("test-secret"),
			);
		});

		it("should handle payload without emailVerified", async () => {
			const payload = {
				sub: "user_123",
				email: "test@example.com",
				username: "testuser",
			};

			const result = await createJWT(payload, mockEnv);

			expect(result).toBe("mock-jwt-token");
			expect(SignJWT).toHaveBeenCalledWith(payload);
		});
	});

	describe("verifyJWT", () => {
		it("should verify and return JWT payload", async () => {
			const mockPayload = {
				sub: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: true,
				iat: 1234567890,
				exp: 1234571490,
			};

			(mockJwtVerify as any).mockResolvedValue({
				payload: mockPayload,
				protectedHeader: { alg: "HS256" },
			});

			const result = await verifyJWT("test-token", mockEnv);

			expect(result).toEqual(mockPayload);
			expect(jwtVerify).toHaveBeenCalledWith(
				"test-token",
				new TextEncoder().encode("test-secret"),
				{ algorithms: ["HS256"] },
			);
		});

		it("should return null for invalid token", async () => {
			(mockJwtVerify as any).mockRejectedValue(new Error("Invalid token"));

			const result = await verifyJWT("invalid-token", mockEnv);

			expect(result).toBeNull();
		});

		it("should return null if required fields are missing", async () => {
			const incompletePayload = {
				sub: "user_123",
				// Missing email and username
			};

			(mockJwtVerify as any).mockResolvedValue({
				payload: incompletePayload,
				protectedHeader: { alg: "HS256" },
			});

			const result = await verifyJWT("test-token", mockEnv);

			expect(result).toBeNull();
		});

		it("should handle missing emailVerified field", async () => {
			const payload = {
				sub: "user_123",
				email: "test@example.com",
				username: "testuser",
				// No emailVerified field
				iat: 1234567890,
				exp: 1234571490,
			};

			(mockJwtVerify as any).mockResolvedValue({
				payload,
				protectedHeader: { alg: "HS256" },
			});

			const result = await verifyJWT("test-token", mockEnv);

			expect(result).toEqual({
				sub: "user_123",
				email: "test@example.com",
				username: "testuser",
				emailVerified: undefined,
				iat: 1234567890,
				exp: 1234571490,
			});
		});
	});

	describe("createRefreshToken", () => {
		it("should create a refresh token", async () => {
			const userId = "user_123";

			const result = await createRefreshToken(userId, mockEnv);

			expect(result).toBe("mock-jwt-token");
			expect(SignJWT).toHaveBeenCalledWith({ sub: userId, type: "refresh" });
			expect(mockSignJWT.setProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
			expect(mockSignJWT.setIssuedAt).toHaveBeenCalled();
			expect(mockSignJWT.setExpirationTime).toHaveBeenCalledWith("30d");
		});
	});

	describe("verifyRefreshToken", () => {
		it("should verify refresh token and return user ID", async () => {
			const mockPayload = {
				sub: "user_123",
				type: "refresh",
				iat: 1234567890,
				exp: 1237159890,
			};

			(mockJwtVerify as any).mockResolvedValue({
				payload: mockPayload,
				protectedHeader: { alg: "HS256" },
			});

			const result = await verifyRefreshToken("refresh-token", mockEnv);

			expect(result).toBe("user_123");
		});

		it("should return null for non-refresh token", async () => {
			const mockPayload = {
				sub: "user_123",
				type: "access", // Not a refresh token
			};

			(mockJwtVerify as any).mockResolvedValue({
				payload: mockPayload,
				protectedHeader: { alg: "HS256" },
			});

			const result = await verifyRefreshToken("token", mockEnv);

			expect(result).toBeNull();
		});

		it("should return null for invalid token", async () => {
			(mockJwtVerify as any).mockRejectedValue(new Error("Invalid token"));

			const result = await verifyRefreshToken("invalid-token", mockEnv);

			expect(result).toBeNull();
		});
	});

	describe("generateToken", () => {
		it("should generate a token with custom parameters", async () => {
			const payload = {
				userId: "user_123",
				email: "test@example.com",
			};

			const result = await generateToken(payload, "custom-secret", "HS512", "7d");

			expect(result).toBe("mock-jwt-token");
			expect(SignJWT).toHaveBeenCalledWith({
				sub: "user_123",
				email: "test@example.com",
			});
			expect(mockSignJWT.setProtectedHeader).toHaveBeenCalledWith({ alg: "HS512" });
			expect(mockSignJWT.setIssuedAt).toHaveBeenCalled();
			expect(mockSignJWT.setExpirationTime).toHaveBeenCalledWith("7d");
			expect(mockSignJWT.sign).toHaveBeenCalledWith(
				new TextEncoder().encode("custom-secret"),
			);
		});
	});
});