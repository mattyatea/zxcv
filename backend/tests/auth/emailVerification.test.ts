import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";
import { setupTestHooks } from "../helpers/setup";

describe("Email Verification Endpoints", () => {
	setupTestHooks();

	describe("POST /auth/send-verification", () => {
		it("should send verification email successfully", async () => {
			const response = await SELF.fetch("http://localhost/auth/send-verification", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "test@example.com",
					locale: "en",
				}),
			});

			if (response.status !== 200) {
				const errorText = await response.text();
				console.log("Error response:", response.status, errorText);
			}

			expect(response.status).toBe(200);
			
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.message).toContain("verification email has been sent");
		});

		it("should return success even if email service fails", async () => {
			const response = await SELF.fetch("http://localhost/auth/send-verification", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "nonexistent@example.com",
				}),
			});

			expect(response.status).toBe(200);
			
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.message).toContain("verification email has been sent");
		});

		it("should return 400 for invalid email", async () => {
			const response = await SELF.fetch("http://localhost/auth/send-verification", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "invalid-email",
				}),
			});

			expect(response.status).toBe(400);
			
			const body = await response.json();
			expect(body.success).toBe(false);
		});

		it("should return 400 for missing email", async () => {
			const response = await SELF.fetch("http://localhost/auth/send-verification", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({}),
			});

			expect(response.status).toBe(400);
			
			const body = await response.json();
			expect(body.success).toBe(false);
		});
	});

	describe("POST /auth/verify-email", () => {
		it("should verify email successfully", async () => {
			// First create a user and get verification token
			const { env } = await import("cloudflare:test");
			
			// Register a user
			const registerResponse = await SELF.fetch("http://localhost/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "verify@example.com",
					username: "verifyuser",
					password: "password123",
				}),
			});

			expect(registerResponse.status).toBe(201);

			// Get the verification token from database
			const tokenResult = await env.DB.prepare("SELECT token FROM email_verifications WHERE user_id = (SELECT id FROM users WHERE email = ?) ORDER BY created_at DESC LIMIT 1")
				.bind("verify@example.com")
				.first();

			expect(tokenResult).toBeDefined();

			// Verify email
			const response = await SELF.fetch("http://localhost/auth/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: tokenResult.token,
				}),
			});

			expect(response.status).toBe(200);
			
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.message).toBe("Email verified successfully");
		});

		it("should return 400 for invalid token", async () => {
			const response = await SELF.fetch("http://localhost/auth/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: "invalid-token",
				}),
			});

			expect(response.status).toBe(400);
			
			const body = await response.json();
			expect(body.success).toBe(false);
			expect(body.message).toBe("Invalid verification token");
		});

		it("should return 400 for missing token", async () => {
			const response = await SELF.fetch("http://localhost/auth/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({}),
			});

			expect(response.status).toBe(400);
			
			const body = await response.json();
			expect(body.success).toBe(false);
		});

		it("should return 400 for empty token", async () => {
			const response = await SELF.fetch("http://localhost/auth/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: "",
				}),
			});

			expect(response.status).toBe(400);
			
			const body = await response.json();
			expect(body.success).toBe(false);
		});
	});
});