import { describe, expect, it, vi, beforeEach } from "vitest";
import { ORPCError } from "@orpc/server";
import { createMockContext } from "~/tests/helpers/mocks";
import { AuthService } from "~/server/services/AuthService";
import { EmailServiceError } from "~/server/types/errors";
import { authErrors } from "~/server/utils/i18n";
import { getLocaleFromRequest } from "~/server/utils/locale";
import type { Locale } from "~/server/utils/locale";
import * as cryptoUtils from "~/server/utils/crypto";
import * as jwtUtils from "~/server/utils/jwt";
vi.mock("~/server/utils/jwt", () => ({
	verifyRefreshToken: vi.fn(),
	createJWT: vi.fn(),
	createRefreshToken: vi.fn(),
}));
import { EmailVerificationService } from "~/server/services/emailVerification";

// Mock dependencies
vi.mock("~/server/utils/crypto");
vi.mock("~/server/utils/jwt");
vi.mock("~/server/services/emailVerification", () => ({
	EmailVerificationService: vi.fn(),
}));

describe("auth procedures", () => {
	let mockPrisma: any;
	let mockContext: any;
	
	// Create simplified procedure handlers that mimic the oRPC pattern
	async function registerHandler({ input, context }: { input: any, context: any }) {
		// Email registration is disabled
		throw new ORPCError("FORBIDDEN", {
			message: "Email registration is disabled. Please use Google or GitHub to sign up.",
		});

		// const { db, env, cloudflare } = context;
		// const authService = new AuthService(db, env);
		// const locale = getLocaleFromRequest(cloudflare?.request) as Locale;
		//
		// try {
		// 	const result = await authService.register(input);
		// 	return {
		// 		success: true,
		// 		message: authErrors.registrationSuccess(locale),
		// 		user: {
		// 			id: result.user.id,
		// 			username: result.user.username,
		// 			email: result.user.email,
		// 		},
		// 	};
		// } catch (error) {
		// 	if (error instanceof EmailServiceError) {
		// 		throw new ORPCError("INTERNAL_SERVER_ERROR", {
		// 			message: authErrors.registrationFailedEmail(locale),
		// 		});
		// 	}
		// 	throw error;
		// }
	}

	async function loginHandler({ input, context }: { input: any, context: any }) {
		// Email login is disabled
		throw new ORPCError("FORBIDDEN", {
			message: "Email login is disabled. Please use Google or GitHub to sign in.",
		});

		// const { db, env, cloudflare } = context;
		// const authService = new AuthService(db, env);
		// const locale = getLocaleFromRequest(cloudflare?.request) as Locale;
		//
		// const result = await authService.login(input.email, input.password, locale);
		// return {
		// 	accessToken: result.accessToken,
		// 	refreshToken: result.refreshToken,
		// 	user: result.user,
		// 	message: authErrors.loginSuccess(locale),
		// };
	}

	async function verifyEmailHandler({ input, context }: { input: any, context: any }) {
		const { db, env } = context;
		const authService = new AuthService(db, env);

		await authService.verifyEmail(input.token);
		return { success: true, message: "Email verified successfully" };
	}

	async function logoutHandler({ input, context }: { input: any, context: any }) {
		const { env, cloudflare } = context;
		const { refreshToken } = input;
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		try {
			const { verifyRefreshToken } = await import("~/server/utils/jwt");
			const userId = await verifyRefreshToken(refreshToken, env);
			if (!userId) {
				throw new ORPCError("UNAUTHORIZED", { message: "Invalid token" });
			}

			return {
				success: true,
				message: "Logged out successfully",
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}
			throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Logout failed" });
		}
	}

	async function refreshHandler({ input, context }: { input: any, context: any }) {
		const { refreshToken } = input;
		const { db, env, cloudflare } = context;
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		const { verifyRefreshToken, createRefreshToken, createJWT } = await import("~/server/utils/jwt");
		const userId = await verifyRefreshToken(refreshToken, env);

		if (!userId) {
			throw new ORPCError("UNAUTHORIZED", { message: "Invalid token" });
		}

		const user = await db.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new ORPCError("UNAUTHORIZED", { message: "User not found" });
		}

		const authUser = {
			id: user.id,
			email: user.email,
			username: user.username,
			role: user.role,
			emailVerified: user.emailVerified,
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
		};

		const accessToken = await createJWT(
			{
				sub: authUser.id,
				email: authUser.email,
				username: authUser.username,
				role: authUser.role,
				emailVerified: authUser.emailVerified,
				displayName: authUser.displayName,
				avatarUrl: authUser.avatarUrl,
			},
			env,
		);
		const newRefreshToken = await createRefreshToken(authUser.id, env);

		return { accessToken, refreshToken: newRefreshToken, user: authUser };
	}

	async function sendPasswordResetHandler({ input, context }: { input: any, context: any }) {
		const { db, env, cloudflare } = context;
		const authService = new AuthService(db, env);
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		await authService.requestPasswordReset(input.email, locale);
		return { success: true, message: "Password reset email sent" };
	}

	async function resetPasswordHandler({ input, context }: { input: any, context: any }) {
		const { db, env, cloudflare } = context;
		const authService = new AuthService(db, env);
		const locale = getLocaleFromRequest(cloudflare?.request) as Locale;

		await authService.resetPassword(input.token, input.newPassword);
		return { success: true, message: "Password reset successfully" };
	}

	beforeEach(() => {
		vi.clearAllMocks();

		// Use the global mock Prisma client
		mockPrisma = (globalThis as any).__mockPrismaClient;
		console.log("Mock Prisma user methods:", Object.keys(mockPrisma?.user || {}));

		// Setup mock context with proper env.DB
		mockContext = createMockContext({
			db: mockPrisma,
			env: {
				DB: {} as any, // Proper DB binding
				JWT_SECRET: "test-jwt-secret",
				JWT_ALGORITHM: "HS256",
				JWT_EXPIRES_IN: "1h",
				REFRESH_TOKEN_EXPIRES_IN: "7d",
				EMAIL_FROM: "test@example.com",
				FRONTEND_URL: "http://localhost:3000",
				R2: {
					put: vi.fn(),
					get: vi.fn(),
					delete: vi.fn(),
				},
				EMAIL_SEND: {
					send: vi.fn().mockResolvedValue({ success: true }),
				},
			},
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

		it("should throw FORBIDDEN error when email registration is disabled", async () => {
			await expect(
				registerHandler({ input: validInput, context: mockContext })
			).rejects.toThrow(ORPCError);

			await expect(
				registerHandler({ input: validInput, context: mockContext })
			).rejects.toThrow("Email registration is disabled");
		});

		// All other tests are commented out because email registration is disabled
		// it("should register a new user successfully", async () => {
		// 	mockPrisma.user.findUnique.mockResolvedValue(null);
		// 	mockPrisma.organization.findUnique.mockResolvedValue(null);
		// 	mockPrisma.user.create.mockResolvedValue({
		// 		id: "user_123",
		// 		username: "testuser",
		// 		email: "test@example.com",
		// 		passwordHash: "hashed_password",
		// 		emailVerified: false,
		// 	});
		//
		// 	const mockEmailService = {
		// 		sendVerificationEmail: vi.fn().mockResolvedValue(true),
		// 	};
		// 	vi.mocked(EmailVerificationService).mockImplementation(() => mockEmailService as any);
		//
		// 	// Direct call to procedure handler - following oRPC testing principles
		// 	const result = await registerHandler({ input: validInput, context: mockContext });
		//
		// 	expect(result).toEqual({
		// 		success: true,
		// 		message: "登録が完了しました。メールアドレスを確認してアカウントを有効化してください。",
		// 		user: {
		// 			id: "user_123",
		// 			username: "testuser",
		// 			email: "test@example.com",
		// 		},
		// 	});
		//
		// 	// Verify database interactions
		// 	expect(mockPrisma.user.create).toHaveBeenCalledWith({
		// 		data: expect.objectContaining({
		// 			id: expect.any(String),
		// 			username: "testuser",
		// 			email: "test@example.com",
		// 			passwordHash: "hashed_password",
		// 			emailVerified: false,
		// 		}),
		// 	});
		// });
		//
		// it("should throw CONFLICT error when user already exists", async () => {
		// 	mockPrisma.user.findUnique.mockResolvedValue({
		// 		id: "existing_user",
		// 		email: "test@example.com",
		// 	});
		//
		// 	// Using oRPC docs pattern: expect().rejects pattern
		// 	await expect(
		// 		registerHandler({ input: validInput, context: mockContext })
		// 	).rejects.toThrow(ORPCError);
		// });
		//
		// it("should throw CONFLICT error when username is not available", async () => {
		// 	// Mock email check passes
		// 	mockPrisma.user.findUnique.mockImplementation(async (args: any) => {
		// 		if (args?.where?.email) {
		// 			return null; // Email not taken
		// 		}
		// 		if (args?.where?.username) {
		// 			return { // Username is taken
		// 				id: "existing_user",
		// 				username: "testuser"
		// 			};
		// 		}
		// 		return null;
		// 	});
		//
		// 	await expect(
		// 		registerHandler({ input: validInput, context: mockContext })
		// 	).rejects.toThrow(ORPCError);
		// });
		//
		// it("should handle email service failure gracefully", async () => {
		// 	mockPrisma.user.findUnique.mockResolvedValue(null);
		// 	mockPrisma.organization.findUnique.mockResolvedValue(null);
		// 	mockPrisma.user.create.mockResolvedValue({
		// 		id: "user_123",
		// 		username: "testuser",
		// 		email: "test@example.com",
		// 		passwordHash: "hashed_password",
		// 		emailVerified: false,
		// 	});
		//
		// 	// Mock AuthService to throw an email service error
		// 	const { AuthService } = await import("~/server/services/AuthService");
		// 	const { EmailServiceError } = await import("~/server/types/errors");
		// 	const mockRegister = vi.fn().mockRejectedValue(new EmailServiceError("Email service error"));
		// 	vi.spyOn(AuthService.prototype, "register").mockImplementation(mockRegister);
		//
		// 	await expect(
		// 		registerHandler({ input: validInput, context: mockContext })
		// 	).rejects.toThrow(ORPCError);
		//
		// 	// Restore original
		// 	vi.mocked(AuthService.prototype.register).mockRestore();
		// });
		//
		// it("should validate input format", async () => {
		// 	const invalidInputs = [
		// 		{ username: "", email: "test@example.com", password: "password123" }, // Empty username
		// 		{ username: "test user", email: "test@example.com", password: "password123" }, // Username with space
		// 		{ username: "testuser", email: "invalid-email", password: "password123" }, // Invalid email
		// 		{ username: "testuser", email: "test@example.com", password: "short" }, // Short password
		// 	];
		//
		// 	// Following oRPC docs pattern for multiple tests
		// 	for (const input of invalidInputs) {
		// 		await expect(
		// 			registerHandler({ input, context: mockContext })
		// 		).rejects.toThrow();
		// 	}
		// });
		//
		// it("should normalize username and email to lowercase", async () => {
		// 	mockPrisma.user.findUnique.mockResolvedValue(null);
		// 	mockPrisma.organization.findUnique.mockResolvedValue(null);
		// 	mockPrisma.user.create.mockResolvedValue({
		// 		id: "user_123",
		// 		username: "testuser",
		// 		email: "test@example.com",
		// 		passwordHash: "hashed_password",
		// 		emailVerified: false,
		// 	});
		//
		// 	const mockEmailService = {
		// 		sendVerificationEmail: vi.fn().mockResolvedValue(true),
		// 	};
		// 	vi.mocked(EmailVerificationService).mockImplementation(() => mockEmailService as any);
		//
		// 	// Using oRPC docs pattern
		// 	await expect(
		// 		registerHandler({
		// 			input: {
		// 				username: "TestUser",
		// 				email: "Test@Example.com",
		// 				password: "password123",
		// 			},
		// 			context: mockContext
		// 		})
		// 	).resolves.toEqual({
		// 		success: true,
		// 		message: "登録が完了しました。メールアドレスを確認してアカウントを有効化してください。",
		// 		user: {
		// 			id: "user_123",
		// 			username: "testuser",
		// 			email: "test@example.com",
		// 		},
		// 	});
		//
		// 	// Verify the user was created
		// 	expect(mockPrisma.user.create).toHaveBeenCalled();
		// });
	});

	describe("login", () => {
		const validInput = {
			email: "test@example.com",
			password: "password123",
		};

		it("should throw FORBIDDEN error when email login is disabled", async () => {
			await expect(
				loginHandler({ input: validInput, context: mockContext })
			).rejects.toThrow(ORPCError);

			await expect(
				loginHandler({ input: validInput, context: mockContext })
			).rejects.toThrow("Email login is disabled");
		});

		// All other tests are commented out because email login is disabled
		// it("should login user successfully", async () => {
		// 	const mockUser = {
		// 		id: "user_123",
		// 		username: "testuser",
		// 		email: "test@example.com",
		// 		emailVerified: true,
		// 	};
		//
		// 	// Mock AuthService login to return tokens and user
		// 	const { AuthService } = await import("~/server/services/AuthService");
		// 	const mockLogin = vi.fn().mockResolvedValue({
		// 		accessToken: "access_token",
		// 		refreshToken: "refresh_token",
		// 		user: mockUser,
		// 	});
		// 	vi.spyOn(AuthService.prototype, "login").mockImplementation(mockLogin);
		//
		// 	const result = await loginHandler({ input: validInput, context: mockContext });
		//
		// 	expect(result).toEqual({
		// 		accessToken: "access_token",
		// 		refreshToken: "refresh_token",
		// 		user: mockUser,
		// 		message: "ログインに成功しました",
		// 	});
		//
		// 	expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123", "ja");
		//
		// 	// Restore original
		// 	vi.mocked(AuthService.prototype.login).mockRestore();
		// });
		//
		// it("should throw error for invalid credentials", async () => {
		// 	const { AuthService } = await import("~/server/services/AuthService");
		// 	const mockLogin = vi.fn().mockRejectedValue(
		// 		new ORPCError("UNAUTHORIZED", { message: "Invalid credentials" })
		// 	);
		// 	vi.spyOn(AuthService.prototype, "login").mockImplementation(mockLogin);
		//
		// 	await expect(
		// 		loginHandler({ input: validInput, context: mockContext })
		// 	).rejects.toThrow(ORPCError);
		//
		// 	// Restore original
		// 	vi.mocked(AuthService.prototype.login).mockRestore();
		// });
	});

	describe("verifyEmail", () => {
		const validInput = {
			token: "verification_token",
		};

		it("should verify email successfully", async () => {
			const { AuthService } = await import("~/server/services/AuthService");
			const mockVerifyEmail = vi.fn().mockResolvedValue(undefined);
			vi.spyOn(AuthService.prototype, "verifyEmail").mockImplementation(mockVerifyEmail);

			const result = await verifyEmailHandler({ input: validInput, context: mockContext });

			expect(result).toEqual({
				success: true,
				message: "Email verified successfully",
			});

			expect(mockVerifyEmail).toHaveBeenCalledWith("verification_token");

			// Restore original
			vi.mocked(AuthService.prototype.verifyEmail).mockRestore();
		});

		it("should throw error for invalid token", async () => {
			const { AuthService } = await import("~/server/services/AuthService");
			const mockVerifyEmail = vi.fn().mockRejectedValue(
				new ORPCError("BAD_REQUEST", { message: "Invalid token" })
			);
			vi.spyOn(AuthService.prototype, "verifyEmail").mockImplementation(mockVerifyEmail);

			await expect(
				verifyEmailHandler({ input: validInput, context: mockContext })
			).rejects.toThrow(ORPCError);

			// Restore original
			vi.mocked(AuthService.prototype.verifyEmail).mockRestore();
		});
	});

	describe("logout", () => {
		const validInput = {
			refreshToken: "refresh_token",
		};

		it("should logout successfully", async () => {
			vi.mocked(jwtUtils.verifyRefreshToken).mockResolvedValue("user_123");

			const result = await logoutHandler({ input: validInput, context: mockContext });

			expect(result).toEqual({
				success: true,
				message: "Logged out successfully",
			});

			expect(jwtUtils.verifyRefreshToken).toHaveBeenCalledWith("refresh_token", mockContext.env);
		});

		it("should throw error for invalid refresh token", async () => {
			vi.mocked(jwtUtils.verifyRefreshToken).mockResolvedValue(null);

			await expect(
				logoutHandler({ input: validInput, context: mockContext })
			).rejects.toThrow(ORPCError);
		});
	});

	describe("refresh", () => {
		const validInput = {
			refreshToken: "refresh_token",
		};

		const mockUser = {
			id: "user_123",
			username: "testuser",
			email: "test@example.com",
			emailVerified: true,
			role: "user",
			displayName: null,
			avatarUrl: null,
			bio: null,
			location: null,
			website: null,
			createdAt: 1640995200,
			updatedAt: 1640995200,
		};

		it("should refresh tokens successfully", async () => {
			vi.mocked(jwtUtils.verifyRefreshToken).mockResolvedValue("user_123");
			vi.mocked(jwtUtils.createJWT).mockResolvedValue("new_access_token");
			vi.mocked(jwtUtils.createRefreshToken).mockResolvedValue("new_refresh_token");
			mockPrisma.user.findUnique.mockResolvedValue(mockUser);

			const result = await refreshHandler({ input: validInput, context: mockContext });

			expect(result).toEqual({
				accessToken: "new_access_token",
				refreshToken: "new_refresh_token",
				user: {
					id: "user_123",
					email: "test@example.com",
					username: "testuser",
					role: "user",
					emailVerified: true,
					displayName: null,
					avatarUrl: null,
				},
			});

			expect(jwtUtils.verifyRefreshToken).toHaveBeenCalledWith("refresh_token", mockContext.env);
			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "user_123" } });
		});

		it("should throw error for invalid refresh token", async () => {
			vi.mocked(jwtUtils.verifyRefreshToken).mockResolvedValue(null);

			await expect(
				refreshHandler({ input: validInput, context: mockContext })
			).rejects.toThrow(ORPCError);
		});

		it("should throw error when user not found", async () => {
			vi.mocked(jwtUtils.verifyRefreshToken).mockResolvedValue("user_123");
			mockPrisma.user.findUnique.mockResolvedValue(null);

			await expect(
				refreshHandler({ input: validInput, context: mockContext })
			).rejects.toThrow(ORPCError);
		});
	});

	describe("sendPasswordReset", () => {
		const validInput = {
			email: "test@example.com",
		};

		it("should send password reset email successfully", async () => {
			const { AuthService } = await import("~/server/services/AuthService");
			const mockRequestPasswordReset = vi.fn().mockResolvedValue(undefined);
			vi.spyOn(AuthService.prototype, "requestPasswordReset").mockImplementation(mockRequestPasswordReset);

			const result = await sendPasswordResetHandler({ input: validInput, context: mockContext });

			expect(result).toEqual({
				success: true,
				message: "Password reset email sent",
			});

			expect(mockRequestPasswordReset).toHaveBeenCalledWith("test@example.com", "ja");

			// Restore original
			vi.mocked(AuthService.prototype.requestPasswordReset).mockRestore();
		});
	});

	describe("resetPassword", () => {
		const validInput = {
			token: "reset_token",
			newPassword: "newPassword123",
		};

		it("should reset password successfully", async () => {
			const { AuthService } = await import("~/server/services/AuthService");
			const mockResetPassword = vi.fn().mockResolvedValue(undefined);
			vi.spyOn(AuthService.prototype, "resetPassword").mockImplementation(mockResetPassword);

			const result = await resetPasswordHandler({ input: validInput, context: mockContext });

			expect(result).toEqual({
				success: true,
				message: "Password reset successfully",
			});

			expect(mockResetPassword).toHaveBeenCalledWith("reset_token", "newPassword123");

			// Restore original
			vi.mocked(AuthService.prototype.resetPassword).mockRestore();
		});
	});
});