import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { SendVerificationRoute } from "../../src/endpoints/auth/sendVerification";
import { VerifyEmailRoute } from "../../src/endpoints/auth/verifyEmail";
import { EmailVerificationService } from "../../src/services/emailVerification";
import type { Env } from "../../src/types/env";

// Mock the EmailVerificationService
vi.mock("../../src/services/emailVerification", () => ({
	EmailVerificationService: vi.fn(),
}));

// Mock the database utilities
vi.mock("../../src/utils/prisma", () => ({
	createPrismaClient: vi.fn(),
}));

describe("Email Verification Endpoints", () => {
	let app: Hono;
	let mockEnv: Env;
	let mockEmailVerificationService: any;

	beforeEach(() => {
		app = new Hono();
		
		mockEnv = {
			FRONTEND_URL: "https://test.zxcv.dev",
			EMAIL_SENDER: {} as any,
			EMAIL_FROM: "test@zxcv.dev",
		} as Env;

		mockEmailVerificationService = {
			resendVerificationEmail: vi.fn(),
			verifyEmail: vi.fn(),
		};

		(EmailVerificationService as any).mockImplementation(() => mockEmailVerificationService);

		// Setup routes
		app.post("/send-verification", new SendVerificationRoute().handle);
		app.post("/verify-email", new VerifyEmailRoute().handle);

		vi.clearAllMocks();
	});

	describe("POST /send-verification", () => {
		it("should send verification email successfully", async () => {
			mockEmailVerificationService.resendVerificationEmail.mockResolvedValueOnce(true);

			const response = await app.request("/send-verification", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "test@example.com",
					locale: "en",
				}),
			});

			expect(response.status).toBe(200);
			
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.message).toContain("verification email has been sent");
		});

		it("should return success even if email service fails", async () => {
			mockEmailVerificationService.resendVerificationEmail.mockResolvedValueOnce(false);

			const response = await app.request("/send-verification", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "test@example.com",
				}),
			});

			expect(response.status).toBe(200);
			
			const body = await response.json();
			expect(body.success).toBe(false);
			expect(body.message).toContain("Failed to send verification email");
		});

		it("should return 400 for invalid email", async () => {
			const response = await app.request("/send-verification", {
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
			const response = await app.request("/send-verification", {
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

	describe("POST /verify-email", () => {
		it("should verify email successfully", async () => {
			const mockResult = {
				success: true,
				userId: "user-123",
			};

			mockEmailVerificationService.verifyEmail.mockResolvedValueOnce(mockResult);

			const response = await app.request("/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: "valid-token-123",
				}),
			});

			expect(response.status).toBe(200);
			
			const body = await response.json();
			expect(body.success).toBe(true);
			expect(body.userId).toBe("user-123");
			expect(body.message).toBe("Email verified successfully");
		});

		it("should return 400 for invalid token", async () => {
			const mockResult = {
				success: false,
				message: "Invalid verification token",
			};

			mockEmailVerificationService.verifyEmail.mockResolvedValueOnce(mockResult);

			const response = await app.request("/verify-email", {
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

		it("should return 400 for expired token", async () => {
			const mockResult = {
				success: false,
				message: "Verification token has expired",
			};

			mockEmailVerificationService.verifyEmail.mockResolvedValueOnce(mockResult);

			const response = await app.request("/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: "expired-token",
				}),
			});

			expect(response.status).toBe(400);
			
			const body = await response.json();
			expect(body.success).toBe(false);
			expect(body.message).toBe("Verification token has expired");
		});

		it("should return 400 for missing token", async () => {
			const response = await app.request("/verify-email", {
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
			const response = await app.request("/verify-email", {
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