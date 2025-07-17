import { describe, expect, it } from "vitest";
import { createJWT, verifyJWT } from "../../src/middleware/auth";

describe("JWT utilities", () => {
	const mockEnv = {
		JWT_SECRET: "test-secret-key-for-jwt-signing",
		JWT_ALGORITHM: "HS256",
		JWT_EXPIRES_IN: "1h",
	};

	const mockUser = {
		id: "user123",
		email: "test@example.com",
		username: "testuser",
	};

	describe("createJWT", () => {
		it("should create a JWT token", async () => {
			const token = await createJWT(mockUser, mockEnv as any);
			
			expect(token).toBeDefined();
			expect(typeof token).toBe("string");
			expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
		});

		it("should create different tokens for same user", async () => {
			const token1 = await createJWT(mockUser, mockEnv as any);
			// Add a delay to ensure different timestamps
			await new Promise(resolve => setTimeout(resolve, 1100));
			const token2 = await createJWT(mockUser, mockEnv as any);
			
			// Tokens should be different due to timestamps
			expect(token1).not.toBe(token2);
		});
	});

	describe("verifyJWT", () => {
		it("should verify a valid JWT token", async () => {
			const token = await createJWT(mockUser, mockEnv as any);
			const decoded = await verifyJWT(token, mockEnv as any);
			
			expect(decoded).toBeDefined();
			expect(decoded?.id).toBe(mockUser.id);
			expect(decoded?.email).toBe(mockUser.email);
			expect(decoded?.username).toBe(mockUser.username);
		});

		it("should reject invalid JWT token", async () => {
			const invalidToken = "invalid.jwt.token";
			const decoded = await verifyJWT(invalidToken, mockEnv as any);
			
			expect(decoded).toBeNull();
		});

		it("should reject tampered JWT token", async () => {
			const token = await createJWT(mockUser, mockEnv as any);
			const tamperedToken = token.slice(0, -5) + "xxxxx";
			const decoded = await verifyJWT(tamperedToken, mockEnv as any);
			
			expect(decoded).toBeNull();
		});

		it("should handle empty token", async () => {
			const decoded = await verifyJWT("", mockEnv as any);
			
			expect(decoded).toBeNull();
		});
	});
});