import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { EmailService } from "~/server/utils/email";
import type { Env } from "~/server/types/env";
import { createMimeMessage } from "mimetext";

// Mock mimetext
vi.mock("mimetext", () => ({
	createMimeMessage: vi.fn(),
}));

// Mock cloudflare:email module
vi.mock("cloudflare:email", () => ({
	EmailMessage: vi.fn().mockImplementation((from, to, raw) => ({
		from,
		to,
		raw,
	})),
}));

describe("EmailService", () => {
	let emailService: EmailService;
	let mockEnv: Env;
	let mockMimeMessage: any;
	let mockEmailSender: any;
	let consoleLogSpy: any;
	let consoleErrorSpy: any;

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock console methods
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		// Mock environment
		mockEmailSender = {
			send: vi.fn().mockResolvedValue(true),
		};

		mockEnv = {
			EMAIL_FROM: "noreply@example.com",
			APP_URL: "https://example.com",
			EMAIL_SENDER: mockEmailSender,
		} as any;

		// Mock MIME message
		mockMimeMessage = {
			setSender: vi.fn(),
			setRecipient: vi.fn(),
			setSubject: vi.fn(),
			addMessage: vi.fn(),
			asRaw: vi.fn().mockReturnValue("raw-email-content"),
		};

		vi.mocked(createMimeMessage).mockReturnValue(mockMimeMessage);

		emailService = new EmailService(mockEnv);
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		consoleErrorSpy.mockRestore();
		vi.unstubAllEnvs();
	});

	describe("constructor", () => {
		it("should use provided email and URL from environment", () => {
			const service = new EmailService(mockEnv);
			expect(service["fromEmail"]).toBe("noreply@example.com");
			expect(service["baseUrl"]).toBe("https://example.com");
		});

		it("should use default values when not provided", () => {
			const envWithoutConfig = {} as Env;
			const service = new EmailService(envWithoutConfig);
			expect(service["fromEmail"]).toBe("noreply@prism-project.net");
			expect(service["baseUrl"]).toBe("https://zxcv.dev");
		});

		it("should prefer FRONTEND_URL over default", () => {
			const envWithFrontendUrl = {
				FRONTEND_URL: "https://frontend.example.com",
			} as Env;
			const service = new EmailService(envWithFrontendUrl);
			expect(service["baseUrl"]).toBe("https://frontend.example.com");
		});
	});

	describe("sendEmail", () => {
		it("should send email successfully in production environment", async () => {
			// Mock non-test environment
			vi.stubEnv("NODE_ENV", "production");

			const template = {
				to: "user@example.com",
				subject: "Test Subject",
				html: "<p>Test HTML</p>",
				text: "Test Text",
			};

			const result = await emailService.sendEmail(template);

			expect(result).toBe(true);
			expect(createMimeMessage).toHaveBeenCalled();
			expect(mockMimeMessage.setSender).toHaveBeenCalledWith({
				name: "zxcv",
				addr: "noreply@example.com",
			});
			expect(mockMimeMessage.setRecipient).toHaveBeenCalledWith("user@example.com");
			expect(mockMimeMessage.setSubject).toHaveBeenCalledWith("Test Subject");
			expect(mockMimeMessage.addMessage).toHaveBeenCalledTimes(2);
			expect(mockMimeMessage.addMessage).toHaveBeenCalledWith({
				contentType: "text/plain",
				data: "Test Text",
			});
			expect(mockMimeMessage.addMessage).toHaveBeenCalledWith({
				contentType: "text/html",
				data: "<p>Test HTML</p>",
			});
		});

		it("should log email in test environment", async () => {
			// Mock test environment
			vi.stubEnv("NODE_ENV", "test");

			const template = {
				to: "user@example.com",
				subject: "Test Subject",
				html: "<p>Test HTML</p>",
				text: "Test Text",
			};

			const result = await emailService.sendEmail(template);

			expect(result).toBe(true);
			expect(consoleLogSpy).toHaveBeenCalledWith("[TEST] Email would be sent to: user@example.com");
			expect(consoleLogSpy).toHaveBeenCalledWith("[TEST] Subject: Test Subject");
			expect(consoleLogSpy).toHaveBeenCalledWith("[DEV] Text content: Test Text");
			expect(mockEmailSender.send).not.toHaveBeenCalled();
		});

		it("should handle missing EMAIL_SENDER binding", async () => {
			// Remove EMAIL_SENDER
			(mockEnv as any).EMAIL_SENDER = undefined;
			vi.stubEnv("NODE_ENV", "production");

			const template = {
				to: "user@example.com",
				subject: "Test Subject",
				html: "<p>Test HTML</p>",
				text: "Test Text",
			};

			const result = await emailService.sendEmail(template);

			expect(result).toBe(false);
			expect(consoleErrorSpy).toHaveBeenCalledWith("EMAIL_SENDER binding is not configured");
			expect(consoleLogSpy).toHaveBeenCalledWith("[DEV] Email would be sent to: user@example.com");
		});

		it("should handle email sending errors", async () => {
			vi.stubEnv("NODE_ENV", "production");
			
			// Mock globalThis.EmailMessage to trigger Cloudflare Workers path
			(globalThis as any).EmailMessage = vi.fn();
			
			// Make createMimeMessage throw an error
			vi.mocked(createMimeMessage).mockImplementation(() => {
				throw new Error("Failed to create message");
			});

			const template = {
				to: "user@example.com",
				subject: "Test Subject",
				html: "<p>Test HTML</p>",
				text: "Test Text",
			};

			const result = await emailService.sendEmail(template);

			expect(result).toBe(false);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Email sending error:",
				expect.any(Error),
			);
			
			// Cleanup
			delete (globalThis as any).EmailMessage;
			// Reset mock
			vi.mocked(createMimeMessage).mockReturnValue(mockMimeMessage);
		});

		it("should detect test environment by fromEmail", async () => {
			mockEnv.EMAIL_FROM = "test@example.com";
			const service = new EmailService(mockEnv);

			const template = {
				to: "user@example.com",
				subject: "Test Subject",
				html: "<p>Test HTML</p>",
				text: "Test Text",
			};

			const result = await service.sendEmail(template);

			expect(result).toBe(true);
			expect(consoleLogSpy).toHaveBeenCalledWith("[TEST] Email would be sent to: user@example.com");
		});
	});

	describe("generatePasswordResetEmail", () => {
		it("should generate password reset email in Japanese", () => {
			const data = {
				email: "user@example.com",
				resetToken: "reset-token-123",
				resetUrl: "https://example.com/reset",
				userLocale: "ja",
			};

			const result = emailService.generatePasswordResetEmail(data);

			expect(result.to).toBe("user@example.com");
			expect(result.subject).toBe("【zxcv】パスワードリセットのお知らせ");
			expect(result.html).toContain("パスワードリセット");
			expect(result.html).toContain(
				`https://example.com/reset-password?token=reset-token-123`,
			);
			expect(result.text).toContain("パスワードリセットのリクエストを受け付けました");
		});

		it("should generate password reset email in English", () => {
			const data = {
				email: "user@example.com",
				resetToken: "reset-token-123",
				resetUrl: "https://example.com/reset",
				userLocale: "en",
			};

			const result = emailService.generatePasswordResetEmail(data);

			expect(result.to).toBe("user@example.com");
			expect(result.subject).toBe("zxcv - Password Reset");
			expect(result.html).toContain("Password Reset");
			expect(result.html).toContain(
				`https://example.com/reset-password?token=reset-token-123`,
			);
			expect(result.text).toContain("We received a request to reset your password");
		});

		it("should default to English when locale is not provided", () => {
			const data = {
				email: "user@example.com",
				resetToken: "reset-token-123",
				resetUrl: "https://example.com/reset",
			};

			const result = emailService.generatePasswordResetEmail(data);

			expect(result.subject).toBe("zxcv - Password Reset");
		});
	});

	describe("generateEmailVerificationEmail", () => {
		it("should generate email verification in Japanese", () => {
			const data = {
				email: "user@example.com",
				verificationToken: "verify-token-123",
				verificationUrl: "https://example.com/verify",
				userLocale: "ja",
			};

			const result = emailService.generateEmailVerificationEmail(data);

			expect(result.to).toBe("user@example.com");
			expect(result.subject).toBe("【zxcv】メールアドレスの確認");
			expect(result.html).toContain("メールアドレスの確認");
			expect(result.html).toContain(
				`https://example.com/verifyemail?token=verify-token-123`,
			);
			expect(result.text).toContain("zxcvへのご登録ありがとうございます");
		});

		it("should generate email verification in English", () => {
			const data = {
				email: "user@example.com",
				verificationToken: "verify-token-123",
				verificationUrl: "https://example.com/verify",
				userLocale: "en",
			};

			const result = emailService.generateEmailVerificationEmail(data);

			expect(result.to).toBe("user@example.com");
			expect(result.subject).toBe("zxcv - Email Verification");
			expect(result.html).toContain("Email Verification");
			expect(result.html).toContain(
				`https://example.com/verifyemail?token=verify-token-123`,
			);
			expect(result.text).toContain("Thank you for signing up for zxcv!");
		});
	});

	describe("generateOrganizationInvitationEmail", () => {
		it("should generate organization invitation in Japanese", () => {
			const data = {
				email: "user@example.com",
				organizationName: "Test Organization",
				inviterName: "Test User",
				invitationToken: "invite-token-123",
				userLocale: "ja",
			};

			const result = emailService.generateOrganizationInvitationEmail(data);

			expect(result.to).toBe("user@example.com");
			expect(result.subject).toBe("【zxcv】Test Organizationへの招待");
			expect(result.html).toContain("Test Userさんから「Test Organization」組織への招待");
			expect(result.html).toContain(
				`https://example.com/organizations/join?token=invite-token-123`,
			);
			expect(result.text).toContain("組織への招待が届きました");
		});

		it("should generate organization invitation in English", () => {
			const data = {
				email: "user@example.com",
				organizationName: "Test Organization",
				inviterName: "Test User",
				invitationToken: "invite-token-123",
				userLocale: "en",
			};

			const result = emailService.generateOrganizationInvitationEmail(data);

			expect(result.to).toBe("user@example.com");
			expect(result.subject).toBe("zxcv - Invitation to Test Organization");
			expect(result.html).toContain('Test User has invited you to join the "Test Organization"');
			expect(result.html).toContain(
				`https://example.com/organizations/join?token=invite-token-123`,
			);
			expect(result.text).toContain("has invited you to join");
		});

		it("should default to Japanese for organization invitations", () => {
			const data = {
				email: "user@example.com",
				organizationName: "Test Organization",
				inviterName: "Test User",
				invitationToken: "invite-token-123",
			};

			const result = emailService.generateOrganizationInvitationEmail(data);

			expect(result.subject).toBe("【zxcv】Test Organizationへの招待");
		});
	});

	describe("isTestEnvironment", () => {
		it("should detect test environment by NODE_ENV", () => {
			vi.stubEnv("NODE_ENV", "test");
			const service = new EmailService(mockEnv);
			expect(service["isTestEnvironment"]()).toBe(true);
		});

		it("should detect test environment by VITEST", () => {
			vi.stubEnv("VITEST", "true");
			const service = new EmailService(mockEnv);
			expect(service["isTestEnvironment"]()).toBe(true);
		});

		it("should detect test environment by email", () => {
			mockEnv.EMAIL_FROM = "test@example.com";
			const service = new EmailService(mockEnv);
			expect(service["isTestEnvironment"]()).toBe(true);
		});

		it("should detect test environment by baseUrl", () => {
			mockEnv.APP_URL = "http://localhost:3000";
			const service = new EmailService(mockEnv);
			expect(service["isTestEnvironment"]()).toBe(true);
		});

		it("should not detect test environment in production", () => {
			vi.stubEnv("NODE_ENV", "production");
			const service = new EmailService(mockEnv);
			expect(service["isTestEnvironment"]()).toBe(false);
		});
	});
});