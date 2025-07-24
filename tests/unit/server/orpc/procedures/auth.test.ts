import { describe, expect, it, vi, beforeEach } from "vitest";
import { ORPCError } from "@orpc/server";
import { authProcedures } from "~/server/orpc/procedures/auth";
import { callProcedure, expectORPCError } from "~/tests/helpers/orpc";
import { createMockContext } from "~/tests/helpers/mocks";
import * as cryptoUtils from "~/server/utils/crypto";
import * as jwtUtils from "~/server/utils/jwt";
import { EmailVerificationService } from "~/server/services/emailVerification";
import type { PrismaClient } from "@prisma/client";

// Mock dependencies
vi.mock("~/server/utils/crypto");
vi.mock("~/server/utils/jwt");
vi.mock("~/server/services/emailVerification", () => ({
	EmailVerificationService: vi.fn(),
}));

describe("auth procedures", () => {
	let mockPrisma: any;
	let mockContext: any;

	beforeEach(() => {
		vi.clearAllMocks();

		// Use the global mock Prisma client
		mockPrisma = (globalThis as any).__mockPrismaClient;

		// Setup mock context
		mockContext = createMockContext({
			db: mockPrisma,
		});

		// Setup default mocks
		vi.mocked(cryptoUtils.generateId).mockReturnValue("user_123");
		vi.mocked(cryptoUtils.hashPassword).mockResolvedValue("hashed_password");
		vi.mocked(cryptoUtils.verifyPassword).mockResolvedValue(false);
		vi.mocked(jwtUtils.createJWT).mockResolvedValue("jwt_token");
	});

	describe("register", () => {
		const validInput = {
			username: "testuser",
			email: "test@example.com",
			password: "password123",
		};

		it("should register a new user successfully", async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			mockPrisma.organization.findUnique.mockResolvedValue(null);
			mockPrisma.user.create.mockResolvedValue({
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				passwordHash: "hashed_password",
				emailVerified: false,
			});

			const mockEmailService = {
				sendVerificationEmail: vi.fn().mockResolvedValue(true),
			};
			vi.mocked(EmailVerificationService).mockImplementation(() => mockEmailService as any);

			console.log("Test input:", validInput);
			console.log("Test context:", mockContext);
			let result;
			try {
				result = await callProcedure(authProcedures.register, validInput, mockContext);
				console.log("Result:", result);
			} catch (error) {
				console.error("Test error:", error);
				throw error;
			}

			expect(result).toEqual({
				success: true,
				message: "登録が完了しました。メールアドレスを確認してアカウントを有効化してください。",
				user: {
					id: "user_123",
					username: "testuser",
					email: "test@example.com",
				},
			});

			expect(mockPrisma.user.create).toHaveBeenCalledWith({
				data: {
					id: "user_123",
					username: "testuser",
					email: "test@example.com",
					passwordHash: "hashed_password",
					emailVerified: false,
				},
			});

			expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
				"user_123",
				"test@example.com",
			);
		});

		it("should throw CONFLICT error when user already exists", async () => {
			mockPrisma.user.findUnique.mockResolvedValue({
				id: "existing_user",
				email: "test@example.com",
			});

			const error = await expectORPCError(
				authProcedures.register,
				validInput,
				mockContext,
			);

			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError<any, any>).code).toBe("CONFLICT");
			expect((error as ORPCError<any, any>).message).toBe("このメールアドレスは既に使用されています");
		});

		it("should throw CONFLICT error when username is not available", async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			mockPrisma.organization.findUnique.mockResolvedValue({ 
				id: "org_123",
				name: "testuser"
			});

			const error = await expectORPCError(
				authProcedures.register,
				validInput,
				mockContext,
			);

			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError<any, any>).code).toBe("CONFLICT");
			expect((error as ORPCError<any, any>).message).toBe("このユーザー名は既に使用されています");
		});

		it("should handle email service failure gracefully", async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			mockPrisma.organization.findUnique.mockResolvedValue(null);
			mockPrisma.user.create.mockResolvedValue({
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				passwordHash: "hashed_password",
				emailVerified: false,
			});
			mockPrisma.user.delete.mockResolvedValue({
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
			});

			const mockEmailService = {
				sendVerificationEmail: vi.fn().mockRejectedValue(new Error("Email service error")),
			};
			vi.mocked(EmailVerificationService).mockImplementation(() => mockEmailService as any);

			const error = await expectORPCError(
				authProcedures.register,
				validInput,
				mockContext,
			);

			expect(error).toBeInstanceOf(ORPCError);
			expect((error as ORPCError<any, any>).code).toBe("INTERNAL_SERVER_ERROR");
			expect((error as ORPCError<any, any>).message).toBe("登録に失敗しました。確認メールを送信できませんでした。サポートにお問い合わせください。");

			// Should delete the user on email failure
			expect(mockPrisma.user.delete).toHaveBeenCalledWith({
				where: { id: "user_123" },
			});
		});

		it("should validate input format", async () => {
			const invalidInputs = [
				{ username: "", email: "test@example.com", password: "password123" }, // Empty username
				{ username: "test user", email: "test@example.com", password: "password123" }, // Username with space
				{ username: "testuser", email: "invalid-email", password: "password123" }, // Invalid email
				{ username: "testuser", email: "test@example.com", password: "short" }, // Short password
			];

			for (const input of invalidInputs) {
				await expect(
					callProcedure(authProcedures.register, input, mockContext),
				).rejects.toThrow();
			}
		});

		it("should normalize username and email to lowercase", async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			mockPrisma.organization.findUnique.mockResolvedValue(null);
			mockPrisma.user.create.mockResolvedValue({
				id: "user_123",
				username: "testuser",
				email: "test@example.com",
				passwordHash: "hashed_password",
				emailVerified: false,
			});

			const mockEmailService = {
				sendVerificationEmail: vi.fn().mockResolvedValue(true),
			};
			vi.mocked(EmailVerificationService).mockImplementation(() => mockEmailService as any);

			await callProcedure(
				authProcedures.register,
				{
					username: "TestUser",
					email: "Test@Example.com",
					password: "password123",
				},
				mockContext,
			);

			// Should check email first
			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: "test@example.com" },
			});
			// Then check username
			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { username: "testuser" },
			});

			expect(mockPrisma.user.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					username: "testuser",
					email: "test@example.com",
				}),
			});
		});
	});

	// Add more test suites for other auth procedures (login, logout, verifyEmail, etc.)
	// when we read more of the auth.ts file
});