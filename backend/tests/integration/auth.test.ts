import { describe, expect, it } from "vitest";
import { SELF } from "cloudflare:test";
import { setupTestHooks } from "../helpers/setup";

describe("Auth endpoints", () => {
	setupTestHooks();
	describe("POST /auth/register", () => {
		it("should register a new user successfully", async () => {
			const timestamp = Date.now();
			const shortId = Math.floor(Math.random() * 10000);
			const response = await SELF.fetch("http://localhost/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: `test-${timestamp}@example.com`,
					username: `user${shortId}`,
					password: "password123",
				}),
			});

			if (response.status !== 201) {
				const error = await response.text();
				console.error("Registration failed:", response.status, error);
			}
			
			expect(response.status).toBe(201);
			
			const data = await response.json();
			expect(data.user.email).toBe(`test-${timestamp}@example.com`);
			expect(data.user.username).toBe(`user${shortId}`);
			expect(data.token).toBeDefined();
			expect(data.refreshToken).toBeDefined();
		});

		it("should fail with existing email", async () => {
			const timestamp = Date.now();
			const shortId = Math.floor(Math.random() * 10000);
			const email = `duplicate-${timestamp}@example.com`;
			
			// First registration
			const firstResponse = await SELF.fetch("http://localhost/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					username: `dup1${shortId}`,
					password: "password123",
				}),
			});
			
			if (firstResponse.status !== 201) {
				const error = await firstResponse.text();
				console.error("First registration failed:", firstResponse.status, error);
			}
			
			// Ensure first registration succeeded
			expect(firstResponse.status).toBe(201);

			// Second registration with same email
			const response = await SELF.fetch("http://localhost/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					username: `dup2${shortId}`,
					password: "password123",
				}),
			});

			expect(response.status).toBe(409);
			
			const data = await response.json();
			expect(data.error).toContain("already exists");
		});

		it("should fail with invalid email format", async () => {
			const response = await SELF.fetch("http://localhost/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "invalid-email",
					username: "testuser",
					password: "password123",
				}),
			});

			expect(response.status).toBe(400);
			
			const data = await response.json();
			// Check different possible error response formats
			expect(data.error || data.errors || data.message).toBeDefined();
		});

		it("should fail with weak password", async () => {
			const response = await SELF.fetch("http://localhost/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "test2@example.com",
					username: "testuser2",
					password: "123",
				}),
			});

			expect(response.status).toBe(400);
			
			const data = await response.json();
			expect(data.error || data.errors || data.message).toBeDefined();
		});
	});

	describe("POST /auth/login", () => {
		it("should login successfully with valid credentials", async () => {
			// First register a user
			await SELF.fetch("http://localhost/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "login@example.com",
					username: "loginuser",
					password: "password123",
				}),
			});

			// Then login
			const response = await SELF.fetch("http://localhost/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "login@example.com",
					password: "password123",
				}),
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.user.email).toBe("login@example.com");
			expect(data.user.username).toBe("loginuser");
			expect(data.token).toBeDefined();
			expect(data.refreshToken).toBeDefined();
		});

		it("should fail with invalid credentials", async () => {
			const response = await SELF.fetch("http://localhost/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "nonexistent@example.com",
					password: "wrongpassword",
				}),
			});

			expect(response.status).toBe(401);
			
			const data = await response.json();
			expect(data.error).toBe("Invalid credentials");
		});

		it("should fail with missing email", async () => {
			const response = await SELF.fetch("http://localhost/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					password: "password123",
				}),
			});

			expect(response.status).toBe(400);
			
			const data = await response.json();
			expect(data.error || data.errors || data.message).toBeDefined();
		});
	});

	// Note: refresh, logout, forgot-password endpoints use Prisma implementation
	// but the register/login endpoints use SQLite implementation
	// This creates inconsistency in the API, so we'll test only the implemented endpoints
	
	describe("POST /auth/refresh", () => {
		it("should refresh token successfully", async () => {
			// First register and get tokens
			const registerResponse = await SELF.fetch("http://localhost/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "refresh@example.com",
					username: "refreshuser",
					password: "password123",
				}),
			});

			const registerData = await registerResponse.json();
			const refreshToken = registerData.refreshToken;

			// Use refresh token to get new access token
			const refreshResponse = await SELF.fetch("http://localhost/auth/refresh", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					refreshToken,
				}),
			});

			expect(refreshResponse.status).toBe(200);
			
			const refreshData = await refreshResponse.json();
			expect(refreshData.token).toBeDefined();
			expect(refreshData.user.email).toBe("refresh@example.com");
			expect(refreshData.user.username).toBe("refreshuser");
		});

		it("should fail with invalid refresh token", async () => {
			const response = await SELF.fetch("http://localhost/auth/refresh", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					refreshToken: "invalid-token",
				}),
			});

			expect(response.status).toBe(401);
			
			const data = await response.json();
			expect(data.error).toBe("Invalid refresh token");
		});
	});

	describe("POST /auth/logout", () => {
		it("should logout successfully", async () => {
			// First register and get tokens
			const registerResponse = await SELF.fetch("http://localhost/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "logout@example.com",
					username: "logoutuser",
					password: "password123",
				}),
			});

			const registerData = await registerResponse.json();
			const refreshToken = registerData.refreshToken;

			// Logout
			const logoutResponse = await SELF.fetch("http://localhost/auth/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					refreshToken,
				}),
			});

			expect(logoutResponse.status).toBe(200);
			
			const logoutData = await logoutResponse.json();
			expect(logoutData.success).toBe(true);
		});

		it("should handle invalid refresh token", async () => {
			const response = await SELF.fetch("http://localhost/auth/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					refreshToken: "invalid-token",
				}),
			});

			expect(response.status).toBe(401);
			
			const data = await response.json();
			expect(data.error).toBe("Invalid refresh token");
		});
	});

	describe("POST /auth/forgot-password", () => {
		it("should send password reset email for existing user", async () => {
			// First register a user
			const email = `reset-${Date.now()}@example.com`;
			await SELF.fetch("http://localhost/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					username: "resetuser",
					password: "password123",
				}),
			});

			// Request password reset
			const response = await SELF.fetch("http://localhost/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.message).toBe("If an account exists with this email, a password reset link has been sent.");
		});

		it("should return success even for non-existent email (prevent enumeration)", async () => {
			const response = await SELF.fetch("http://localhost/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "nonexistent@example.com",
				}),
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.message).toBe("If an account exists with this email, a password reset link has been sent.");
		});

		it("should fail with invalid email format", async () => {
			const response = await SELF.fetch("http://localhost/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "invalid-email",
				}),
			});

			expect(response.status).toBe(400);
			
			const data = await response.json();
			expect(data.error || data.errors || data.message).toBeDefined();
		});

		it("should fail with missing email", async () => {
			const response = await SELF.fetch("http://localhost/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({}),
			});

			expect(response.status).toBe(400);
			
			const data = await response.json();
			expect(data.error || data.errors || data.message).toBeDefined();
		});
	});

	describe("POST /auth/reset-password", () => {
		it("should fail with invalid token", async () => {
			const response = await SELF.fetch("http://localhost/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: "invalid-token",
					newPassword: "newPassword123",
				}),
			});

			expect(response.status).toBe(400);
			
			const data = await response.json();
			expect(data.error).toBe("Invalid or expired token");
		});

		it("should fail with weak password", async () => {
			const response = await SELF.fetch("http://localhost/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: "some-token",
					newPassword: "123",
				}),
			});

			expect(response.status).toBe(400);
			
			const data = await response.json();
			expect(data.error || data.errors || data.message).toBeDefined();
		});

		it("should fail with missing token", async () => {
			const response = await SELF.fetch("http://localhost/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					newPassword: "newPassword123",
				}),
			});

			expect(response.status).toBe(400);
			
			const data = await response.json();
			expect(data.error || data.errors || data.message).toBeDefined();
		});

		it("should fail with missing newPassword", async () => {
			const response = await SELF.fetch("http://localhost/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: "some-token",
				}),
			});

			expect(response.status).toBe(400);
			
			const data = await response.json();
			expect(data.error || data.errors || data.message).toBeDefined();
		});
	});
});