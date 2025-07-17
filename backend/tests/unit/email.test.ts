import { describe, expect, it, vi } from "vitest";
import { EmailService } from "../../src/utils/email";

describe("Email utilities", () => {
	const mockEnv = {
		EMAIL_FROM: "test@example.com",
		FRONTEND_URL: "https://example.com",
		EMAIL_SENDER: {
			send: vi.fn(),
		},
	};

	describe("EmailService", () => {
		it("should create an email service instance", () => {
			const emailService = new EmailService(mockEnv as any);
			
			expect(emailService).toBeDefined();
		});

		it("should generate password reset email template", () => {
			const emailService = new EmailService(mockEnv as any);
			const resetData = {
				email: "user@example.com",
				resetToken: "reset-token-123",
				resetUrl: "https://example.com/reset",
			};
			
			const template = emailService.generatePasswordResetEmail(resetData);
			
			expect(template).toBeDefined();
			expect(template.to).toBe(resetData.email);
			expect(template.subject).toBeDefined();
			expect(template.html).toBeDefined();
			expect(template.text).toBeDefined();
			expect(template.html).toContain(resetData.resetToken);
			expect(template.text).toContain(resetData.resetToken);
		});

		it("should generate Japanese email template", () => {
			const emailService = new EmailService(mockEnv as any);
			const resetData = {
				email: "user@example.com",
				resetToken: "reset-token-123",
				resetUrl: "https://example.com/reset",
				userLocale: "ja",
			};
			
			const template = emailService.generatePasswordResetEmail(resetData);
			
			expect(template.subject).toContain("ZXCV");
			expect(template.subject).toContain("パスワードリセット");
			expect(template.html).toContain("パスワードリセット");
			expect(template.text).toContain("パスワードリセット");
		});

		it("should generate English email template by default", () => {
			const emailService = new EmailService(mockEnv as any);
			const resetData = {
				email: "user@example.com",
				resetToken: "reset-token-123",
				resetUrl: "https://example.com/reset",
			};
			
			const template = emailService.generatePasswordResetEmail(resetData);
			
			expect(template.subject).toContain("ZXCV");
			expect(template.subject).toContain("Password Reset");
			expect(template.html).toContain("Password Reset");
			expect(template.text).toContain("Password Reset");
		});

		it("should send email successfully", async () => {
			const mockSend = vi.fn().mockResolvedValue(undefined);
			const mockEnvWithSend = {
				...mockEnv,
				EMAIL_SENDER: { send: mockSend },
			};
			
			const emailService = new EmailService(mockEnvWithSend as any);
			const template = {
				to: "user@example.com",
				subject: "Test Subject",
				html: "<h1>Test HTML</h1>",
				text: "Test Text",
			};
			
			const result = await emailService.sendEmail(template);
			
			expect(result).toBe(true);
			expect(mockSend).toHaveBeenCalledOnce();
		});

		it("should handle email sending errors", async () => {
			const mockSend = vi.fn().mockRejectedValue(new Error("Send failed"));
			const mockEnvWithSend = {
				...mockEnv,
				EMAIL_SENDER: { send: mockSend },
			};
			
			const emailService = new EmailService(mockEnvWithSend as any);
			const template = {
				to: "user@example.com",
				subject: "Test Subject",
				html: "<h1>Test HTML</h1>",
				text: "Test Text",
			};
			
			const result = await emailService.sendEmail(template);
			
			expect(result).toBe(false);
			expect(mockSend).toHaveBeenCalledOnce();
		});
	});
});