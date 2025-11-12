import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmailVerificationService } from "~/server/services/EmailVerificationService";
import type { Env } from "~/server/types/env";
import * as cryptoUtils from "~/server/utils/crypto";
import { EmailService } from "~/server/utils/email";

// Mock dependencies
vi.mock("~/server/utils/email", () => ({
	EmailService: vi.fn().mockImplementation(() => ({
		generateEmailVerificationEmail: vi.fn(),
		sendEmail: vi.fn(),
	})),
}));
vi.mock("~/server/utils/crypto");

describe("EmailVerificationService", () => {
	let service: EmailVerificationService;
	let mockPrisma: {
		emailVerification: {
			create: ReturnType<typeof vi.fn>;
			findUnique: ReturnType<typeof vi.fn>;
			update: ReturnType<typeof vi.fn>;
			updateMany: ReturnType<typeof vi.fn>;
		};
		user: {
			findUnique: ReturnType<typeof vi.fn>;
			update: ReturnType<typeof vi.fn>;
		};
	};
	let mockEnv: Env;
	let mockEmailService: {
		generateEmailVerificationEmail: ReturnType<typeof vi.fn>;
		sendEmail: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock Prisma
		mockPrisma = {
			emailVerification: {
				create: vi.fn(),
				findUnique: vi.fn(),
				update: vi.fn(),
				updateMany: vi.fn(),
			},
			user: {
				findUnique: vi.fn(),
				update: vi.fn(),
			},
		};

		// Mock environment
		mockEnv = {
			APP_URL: "https://example.com",
			FRONTEND_URL: "https://frontend.example.com",
		} as Env;

		// Mock EmailService
		mockEmailService = {
			generateEmailVerificationEmail: vi.fn().mockReturnValue({
				to: "test@example.com",
				subject: "Verify Email",
				html: "<p>Verify</p>",
				text: "Verify",
			}),
			sendEmail: vi.fn().mockResolvedValue(true),
		};

		vi.mocked(EmailService).mockImplementation(() => mockEmailService as any);

		// Mock generateId
		let idCounter = 0;
		vi.mocked(cryptoUtils.generateId).mockImplementation(() => `id_${++idCounter}`);

		service = new EmailVerificationService(mockPrisma as any, mockEnv);
	});

	describe("createVerificationToken", () => {
		it("should create and return verification token", async () => {
			const userId = "user_123";
			const expectedToken = "id_1"; // This will be the token
			const expectedId = "id_2"; // This will be the ID

			const result = await service.createVerificationToken(userId);

			expect(result).toBe(expectedToken);
			expect(mockPrisma.emailVerification.create).toHaveBeenCalledWith({
				data: {
					id: expectedId,
					userId,
					token: expectedToken,
					expiresAt: expect.any(Number),
				},
			});

			// Check expiration is ~24 hours from now
			const callData = mockPrisma.emailVerification.create.mock.calls[0][0].data;
			const now = Math.floor(Date.now() / 1000);
			expect(callData.expiresAt).toBeGreaterThan(now + 23 * 60 * 60);
			expect(callData.expiresAt).toBeLessThan(now + 25 * 60 * 60);
		});
	});

	describe("sendVerificationEmail", () => {
		it("should send verification email successfully", async () => {
			const userId = "user_123";
			const email = "test@example.com";
			const userLocale = "ja";

			const result = await service.sendVerificationEmail(userId, email, userLocale);

			expect(result).toBe(true);
			expect(mockPrisma.emailVerification.create).toHaveBeenCalled();
			expect(mockEmailService.generateEmailVerificationEmail).toHaveBeenCalledWith({
				email,
				verificationToken: "id_1",
				verificationUrl: "https://example.com/verifyemail?token=id_1",
				userLocale,
			});
			expect(mockEmailService.sendEmail).toHaveBeenCalled();
		});

		it("should use FRONTEND_URL when APP_URL is not available", async () => {
			mockEnv.APP_URL = undefined;
			service = new EmailVerificationService(mockPrisma as any, mockEnv);

			await service.sendVerificationEmail("user_123", "test@example.com");

			expect(mockEmailService.generateEmailVerificationEmail).toHaveBeenCalledWith(
				expect.objectContaining({
					verificationUrl: "https://frontend.example.com/verifyemail?token=id_1",
				}),
			);
		});

		it("should use default URL when no URL is configured", async () => {
			(mockEnv as any).APP_URL = undefined;
			(mockEnv as any).FRONTEND_URL = undefined;
			service = new EmailVerificationService(mockPrisma as any, mockEnv);

			await service.sendVerificationEmail("user_123", "test@example.com");

			expect(mockEmailService.generateEmailVerificationEmail).toHaveBeenCalledWith(
				expect.objectContaining({
					verificationUrl: "https://zxcv.dev/verifyemail?token=id_1",
				}),
			);
		});

		it("should return false on error", async () => {
			mockPrisma.emailVerification.create.mockRejectedValue(new Error("DB error"));

			const result = await service.sendVerificationEmail("user_123", "test@example.com");

			expect(result).toBe(false);
		});
	});

	describe("verifyEmail", () => {
		const mockVerification = {
			id: "verify_123",
			userId: "user_123",
			token: "test-token",
			expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
			usedAt: null,
			user: { id: "user_123" },
		};

		it("should verify email successfully", async () => {
			mockPrisma.emailVerification.findUnique.mockResolvedValue(mockVerification);

			const result = await service.verifyEmail("test-token");

			expect(result).toEqual({
				success: true,
				userId: "user_123",
			});

			expect(mockPrisma.emailVerification.update).toHaveBeenCalledWith({
				where: { id: "verify_123" },
				data: { usedAt: expect.any(Number) },
			});

			expect(mockPrisma.user.update).toHaveBeenCalledWith({
				where: { id: "user_123" },
				data: { emailVerified: true },
			});
		});

		it("should fail for invalid token", async () => {
			mockPrisma.emailVerification.findUnique.mockResolvedValue(null);

			const result = await service.verifyEmail("invalid-token");

			expect(result).toEqual({
				success: false,
				message: "Invalid verification token",
			});

			expect(mockPrisma.emailVerification.update).not.toHaveBeenCalled();
			expect(mockPrisma.user.update).not.toHaveBeenCalled();
		});

		it("should fail for expired token", async () => {
			const expiredVerification = {
				...mockVerification,
				expiresAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
			};

			mockPrisma.emailVerification.findUnique.mockResolvedValue(expiredVerification);

			const result = await service.verifyEmail("test-token");

			expect(result).toEqual({
				success: false,
				message: "Verification token has expired",
			});
		});

		it("should fail for already used token", async () => {
			const usedVerification = {
				...mockVerification,
				usedAt: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
			};

			mockPrisma.emailVerification.findUnique.mockResolvedValue(usedVerification);

			const result = await service.verifyEmail("test-token");

			expect(result).toEqual({
				success: false,
				message: "Verification token has already been used",
			});
		});

		it("should handle database errors", async () => {
			mockPrisma.emailVerification.findUnique.mockRejectedValue(new Error("DB error"));

			const result = await service.verifyEmail("test-token");

			expect(result).toEqual({
				success: false,
				message: "Internal server error",
			});
		});
	});

	describe("resendVerificationEmail", () => {
		it("should resend verification email for unverified user", async () => {
			const mockUser = {
				id: "user_123",
				email: "test@example.com",
				emailVerified: false,
			};

			mockPrisma.user.findUnique.mockResolvedValue(mockUser);
			mockPrisma.emailVerification.updateMany.mockResolvedValue({ count: 1 });

			const result = await service.resendVerificationEmail("test@example.com", "en");

			expect(result).toBe(true);

			// Should invalidate existing tokens
			expect(mockPrisma.emailVerification.updateMany).toHaveBeenCalledWith({
				where: {
					userId: "user_123",
					usedAt: null,
				},
				data: {
					usedAt: expect.any(Number),
				},
			});

			// Should send new email
			expect(mockEmailService.sendEmail).toHaveBeenCalled();
		});

		it("should return true for non-existent email (security)", async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);

			const result = await service.resendVerificationEmail("nonexistent@example.com");

			expect(result).toBe(true);
			expect(mockPrisma.emailVerification.updateMany).not.toHaveBeenCalled();
			expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
		});

		it("should return true for already verified user", async () => {
			const verifiedUser = {
				id: "user_123",
				email: "test@example.com",
				emailVerified: true,
			};

			mockPrisma.user.findUnique.mockResolvedValue(verifiedUser);

			const result = await service.resendVerificationEmail("test@example.com");

			expect(result).toBe(true);
			expect(mockPrisma.emailVerification.updateMany).not.toHaveBeenCalled();
			expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
		});

		it("should handle errors gracefully", async () => {
			mockPrisma.user.findUnique.mockRejectedValue(new Error("DB error"));

			const result = await service.resendVerificationEmail("test@example.com");

			expect(result).toBe(false);
		});
	});
});
