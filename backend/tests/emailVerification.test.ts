import { describe, it, expect, beforeEach, vi } from "vitest";
import { EmailVerificationService } from "../src/services/emailVerification";
import { EmailService } from "../src/utils/email";
import { generateId } from "../src/utils/crypto";
import type { PrismaClient } from "@prisma/client";
import type { Env } from "../src/types/env";

// Mock the dependencies
vi.mock("../src/utils/crypto", () => ({
	generateId: vi.fn(),
}));

vi.mock("../src/utils/email", () => ({
	EmailService: vi.fn(),
}));

describe("EmailVerificationService", () => {
	let mockPrisma: any;
	let mockEnv: Env;
	let emailVerificationService: EmailVerificationService;
	let mockEmailService: any;

	beforeEach(() => {
		// Mock Prisma client
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
			$transaction: vi.fn(),
		};

		// Mock Environment
		mockEnv = {
			FRONTEND_URL: "https://test.zxcv.dev",
			EMAIL_SENDER: {} as any,
			EMAIL_FROM: "test@zxcv.dev",
		} as Env;

		// Mock EmailService
		mockEmailService = {
			generateEmailVerificationEmail: vi.fn(),
			sendEmail: vi.fn(),
		};

		(EmailService as any).mockImplementation(() => mockEmailService);

		emailVerificationService = new EmailVerificationService(mockPrisma, mockEnv);

		// Reset all mocks
		vi.clearAllMocks();
	});

	describe("createVerificationToken", () => {
		it("should create a verification token successfully", async () => {
			const mockToken = "test-token-123";
			const mockUserId = "user-123";

			(generateId as any).mockReturnValueOnce("verification-id");
			(generateId as any).mockReturnValueOnce(mockToken);

			mockPrisma.emailVerification.create.mockResolvedValueOnce({
				id: "verification-id",
				userId: mockUserId,
				token: mockToken,
			});

			const result = await emailVerificationService.createVerificationToken(mockUserId);

			expect(result).toBe(mockToken);
			expect(mockPrisma.emailVerification.create).toHaveBeenCalledWith({
				data: {
					id: "verification-id",
					userId: mockUserId,
					token: mockToken,
					expiresAt: expect.any(Number),
				},
			});
		});
	});

	describe("sendVerificationEmail", () => {
		it("should send verification email successfully", async () => {
			const mockUserId = "user-123";
			const mockEmail = "test@example.com";
			const mockToken = "test-token-123";

			(generateId as any).mockReturnValueOnce("verification-id");
			(generateId as any).mockReturnValueOnce(mockToken);

			mockPrisma.emailVerification.create.mockResolvedValueOnce({
				id: "verification-id",
				userId: mockUserId,
				token: mockToken,
			});

			mockEmailService.generateEmailVerificationEmail.mockReturnValueOnce({
				to: mockEmail,
				subject: "Test Subject",
				html: "<html>Test</html>",
				text: "Test",
			});

			mockEmailService.sendEmail.mockResolvedValueOnce(true);

			const result = await emailVerificationService.sendVerificationEmail(mockUserId, mockEmail);

			expect(result).toBe(true);
			expect(mockEmailService.generateEmailVerificationEmail).toHaveBeenCalledWith({
				email: mockEmail,
				verificationToken: mockToken,
				verificationUrl: `https://test.zxcv.dev/verify-email?token=${mockToken}`,
				userLocale: undefined,
			});
			expect(mockEmailService.sendEmail).toHaveBeenCalled();
		});

		it("should return false if email sending fails", async () => {
			const mockUserId = "user-123";
			const mockEmail = "test@example.com";

			mockEmailService.sendEmail.mockResolvedValueOnce(false);

			const result = await emailVerificationService.sendVerificationEmail(mockUserId, mockEmail);

			expect(result).toBe(false);
		});
	});

	describe("verifyEmail", () => {
		it("should verify email successfully", async () => {
			const mockToken = "test-token-123";
			const mockUserId = "user-123";
			const mockNow = Math.floor(Date.now() / 1000);

			const mockVerification = {
				id: "verification-id",
				userId: mockUserId,
				token: mockToken,
				expiresAt: mockNow + 3600, // 1 hour from now
				usedAt: null,
				user: {
					id: mockUserId,
					email: "test@example.com",
				},
			};

			mockPrisma.emailVerification.findUnique.mockResolvedValueOnce(mockVerification);
			mockPrisma.$transaction.mockResolvedValueOnce([]);

			const result = await emailVerificationService.verifyEmail(mockToken);

			expect(result.success).toBe(true);
			expect(result.userId).toBe(mockUserId);
			expect(mockPrisma.$transaction).toHaveBeenCalled();
		});

		it("should return error for invalid token", async () => {
			const mockToken = "invalid-token";

			mockPrisma.emailVerification.findUnique.mockResolvedValueOnce(null);

			const result = await emailVerificationService.verifyEmail(mockToken);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Invalid verification token");
		});

		it("should return error for expired token", async () => {
			const mockToken = "expired-token";
			const mockNow = Math.floor(Date.now() / 1000);

			const mockVerification = {
				id: "verification-id",
				userId: "user-123",
				token: mockToken,
				expiresAt: mockNow - 3600, // 1 hour ago
				usedAt: null,
			};

			mockPrisma.emailVerification.findUnique.mockResolvedValueOnce(mockVerification);

			const result = await emailVerificationService.verifyEmail(mockToken);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Verification token has expired");
		});

		it("should return error for already used token", async () => {
			const mockToken = "used-token";
			const mockNow = Math.floor(Date.now() / 1000);

			const mockVerification = {
				id: "verification-id",
				userId: "user-123",
				token: mockToken,
				expiresAt: mockNow + 3600, // 1 hour from now
				usedAt: mockNow - 1800, // 30 minutes ago
			};

			mockPrisma.emailVerification.findUnique.mockResolvedValueOnce(mockVerification);

			const result = await emailVerificationService.verifyEmail(mockToken);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Verification token has already been used");
		});
	});

	describe("resendVerificationEmail", () => {
		it("should resend verification email for existing unverified user", async () => {
			const mockEmail = "test@example.com";
			const mockUser = {
				id: "user-123",
				email: mockEmail,
				emailVerified: false,
			};

			mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
			mockPrisma.emailVerification.updateMany.mockResolvedValueOnce({ count: 1 });

			const mockToken = "new-token-123";
			(generateId as any).mockReturnValueOnce("verification-id");
			(generateId as any).mockReturnValueOnce(mockToken);

			mockPrisma.emailVerification.create.mockResolvedValueOnce({
				id: "verification-id",
				userId: mockUser.id,
				token: mockToken,
			});

			mockEmailService.generateEmailVerificationEmail.mockReturnValueOnce({
				to: mockEmail,
				subject: "Test Subject",
				html: "<html>Test</html>",
				text: "Test",
			});

			mockEmailService.sendEmail.mockResolvedValueOnce(true);

			const result = await emailVerificationService.resendVerificationEmail(mockEmail);

			expect(result).toBe(true);
			expect(mockPrisma.emailVerification.updateMany).toHaveBeenCalledWith({
				where: {
					userId: mockUser.id,
					usedAt: null,
				},
				data: {
					usedAt: expect.any(Number),
				},
			});
		});

		it("should return true for non-existent user (security)", async () => {
			const mockEmail = "nonexistent@example.com";

			mockPrisma.user.findUnique.mockResolvedValueOnce(null);

			const result = await emailVerificationService.resendVerificationEmail(mockEmail);

			expect(result).toBe(true);
		});

		it("should return true for already verified user", async () => {
			const mockEmail = "verified@example.com";
			const mockUser = {
				id: "user-123",
				email: mockEmail,
				emailVerified: true,
			};

			mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

			const result = await emailVerificationService.resendVerificationEmail(mockEmail);

			expect(result).toBe(true);
		});
	});
});