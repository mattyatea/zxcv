import { oc } from "@orpc/contract";
import * as z from "zod";
import {
	AuthUserSchema,
	EmailSchema,
	PasswordSchema,
	SuccessResponseSchema,
	TokensSchema,
	UsernameSchema,
	UserSchema,
} from "../schemas/common";

export const authContract = {
	register: oc
		.route({
			method: "POST",
			path: "/auth/register",
			description: "Register a new user account",
		})
		.input(
			z.object({
				username: UsernameSchema,
				email: EmailSchema,
				password: PasswordSchema,
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				message: z.string(),
				user: UserSchema.pick({ id: true, username: true, email: true }),
			}),
		),

	login: oc
		.route({
			method: "POST",
			path: "/auth/login",
			description: "Login with email and password",
		})
		.input(
			z.object({
				email: EmailSchema,
				password: PasswordSchema.describe("User password"),
				rememberMe: z.boolean().optional().describe("Remember login session"),
			}),
		)
		.output(
			TokensSchema.extend({
				user: AuthUserSchema,
				message: z.string().optional(),
			}),
		),

	refresh: oc
		.route({
			method: "POST",
			path: "/auth/refresh",
			description: "Refresh access token",
		})
		.input(
			z.object({
				refreshToken: z.string(),
			}),
		)
		.output(
			TokensSchema.extend({
				user: AuthUserSchema,
			}),
		),

	verifyEmail: oc
		.route({
			method: "POST",
			path: "/auth/verifyEmail",
			description: "Verify email address",
		})
		.input(
			z.object({
				token: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	sendPasswordReset: oc
		.route({
			method: "POST",
			path: "/auth/sendPasswordReset",
			description: "Send password reset email",
		})
		.input(
			z.object({
				email: EmailSchema,
			}),
		)
		.output(SuccessResponseSchema),

	resetPassword: oc
		.route({
			method: "POST",
			path: "/auth/resetPassword",
			description: "Reset password with token",
		})
		.input(
			z.object({
				token: z.string(),
				newPassword: PasswordSchema,
			}),
		)
		.output(SuccessResponseSchema),

	sendVerification: oc
		.route({
			method: "POST",
			path: "/auth/sendVerification",
			description: "Resend verification email",
		})
		.input(
			z.object({
				email: EmailSchema,
				locale: z.string().optional(),
			}),
		)
		.output(SuccessResponseSchema),

	logout: oc
		.route({
			method: "POST",
			path: "/auth/logout",
			description: "Logout user",
		})
		.input(
			z.object({
				refreshToken: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	oauthInitialize: oc
		.route({
			method: "POST",
			path: "/auth/oauthInitialize",
			description: "Initialize OAuth flow",
		})
		.input(
			z.object({
				provider: z.enum(["google", "github"]),
				redirectUrl: z.string().optional(),
				action: z.enum(["login", "register"]).optional().default("login"),
			}),
		)
		.output(
			z.object({
				authorizationUrl: z.string(),
			}),
		),

	oauthCallback: oc
		.route({
			method: "POST",
			path: "/auth/oauthCallback",
			description: "Handle OAuth callback",
		})
		.input(
			z.object({
				provider: z.enum(["google", "github"]),
				code: z.string(),
				state: z.string(),
			}),
		)
		.output(
			z.union([
				TokensSchema.extend({
					user: AuthUserSchema,
					redirectUrl: z.string(),
				}),
				z.object({
					tempToken: z.string(),
					provider: z.string(),
					requiresUsername: z.literal(true),
				}),
			]),
		),

	checkUsername: oc
		.route({
			method: "POST",
			path: "/auth/checkUsername",
			description: "Check if username is available",
		})
		.input(
			z.object({
				username: UsernameSchema,
			}),
		)
		.output(
			z.object({
				available: z.boolean(),
			}),
		),

	completeOAuthRegistration: oc
		.route({
			method: "POST",
			path: "/auth/completeOAuthRegistration",
			description: "Complete OAuth registration with username",
		})
		.input(
			z.object({
				tempToken: z.string(),
				username: UsernameSchema,
			}),
		)
		.output(
			TokensSchema.extend({
				user: AuthUserSchema,
			}),
		),

	me: oc
		.route({
			method: "GET",
			path: "/auth/me",
			description: "Get current user information",
		})
		.output(AuthUserSchema),

	// Device Authorization Grant (for CLI)
	deviceAuthorize: oc
		.route({
			method: "POST",
			path: "/auth/device/authorize",
			description: "Initialize device authorization flow for CLI",
		})
		.input(
			z.object({
				clientId: z
					.string()
					.describe("Client identifier (e.g., 'cli', 'vscode')"),
				scope: z.string().optional().describe("OAuth2 scopes"),
			}),
		)
		.output(
			z.object({
				deviceCode: z.string().describe("Device verification code"),
				userCode: z
					.string()
					.describe("User-friendly code to enter on the website"),
				verificationUri: z.string().describe("URL where user enters the code"),
				verificationUriComplete: z
					.string()
					.optional()
					.describe("URL with pre-filled code"),
				expiresIn: z
					.number()
					.describe("Lifetime in seconds of the device code"),
				interval: z.number().describe("Minimum polling interval in seconds"),
			}),
		),

	deviceToken: oc
		.route({
			method: "POST",
			path: "/auth/device/token",
			description: "Exchange device code for access token",
		})
		.input(
			z.object({
				deviceCode: z.string().describe("Device verification code"),
				clientId: z.string().describe("Client identifier"),
			}),
		)
		.output(
			z.union([
				z.object({
					accessToken: z.string(),
					tokenType: z.literal("Bearer"),
					expiresIn: z.number().optional(),
					scope: z.string().optional(),
				}),
				z.object({
					error: z.enum([
						"authorization_pending",
						"slow_down",
						"expired_token",
						"access_denied",
					]),
					errorDescription: z.string().optional(),
				}),
			]),
		),

	deviceVerify: oc
		.route({
			method: "POST",
			path: "/auth/device/verify",
			description: "Verify and approve device code",
		})
		.input(
			z.object({
				userCode: z.string().describe("User-friendly code entered by user"),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				message: z.string(),
			}),
		),

	listCliTokens: oc
		.route({
			method: "GET",
			path: "/auth/cli-tokens",
			description: "List user's CLI tokens",
		})
		.output(
			z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					clientId: z.string(),
					lastUsedAt: z.number().nullable(),
					createdAt: z.number(),
				}),
			),
		),

	revokeCliToken: oc
		.route({
			method: "POST",
			path: "/auth/cli-tokens/revoke",
			description: "Revoke a CLI token",
		})
		.input(
			z.object({
				tokenId: z.string(),
			}),
		)
		.output(SuccessResponseSchema),
};
