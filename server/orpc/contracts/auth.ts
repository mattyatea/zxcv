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
			TokensSchema.extend({
				user: AuthUserSchema,
				redirectUrl: z.string(),
			}),
		),
};
