import { oc } from "@orpc/contract";
import * as z from "zod";
import {
	EmailSchema,
	PasswordSchema,
	SuccessResponseSchema,
	UsernameSchema,
	UserProfileSchema,
} from "../schemas/common";

export const usersContract = {
	searchByUsername: oc
		.input(
			z.object({
				username: z.string().min(1),
				limit: z.number().min(1).max(20).default(10),
			}),
		)
		.output(
			z.array(
				z.object({
					id: z.string(),
					username: z.string(),
					email: z.string().nullable(),
				}),
			),
		),

	getProfile: oc
		.route({
			method: "POST",
			path: "/users/getProfile",
			description: "Get user profile by username",
		})
		.input(
			z.object({
				username: z.string().min(1),
			}),
		)
		.output(
			z.object({
				user: z.object({
					id: z.string(),
					username: z.string(),
					email: z.string().nullable(),
					emailVerified: z.boolean(),
					createdAt: z.number(),
					updatedAt: z.number(),
				}),
				stats: z.object({
					rulesCount: z.number(),
					organizationsCount: z.number(),
				}),
				recentRules: z.array(
					z.object({
						id: z.string(),
						name: z.string(),
						description: z.string(),
						visibility: z.string(),
						createdAt: z.number(),
						updatedAt: z.number(),
						organization: z
							.object({
								name: z.string(),
							})
							.nullable(),
					}),
				),
			}),
		),

	profile: oc
		.route({
			method: "GET",
			path: "/users/me",
			description: "Get current user profile",
		})
		.output(
			z.object({
				id: z.string(),
				email: z.string(),
				username: z.string(),
				created_at: z.number(),
				updated_at: z.number(),
			}),
		),

	updateProfile: oc
		.input(
			z.object({
				email: EmailSchema.optional(),
				username: UsernameSchema.optional(),
			}),
		)
		.output(
			z.object({
				user: UserProfileSchema,
			}),
		),

	changePassword: oc
		.input(
			z.object({
				currentPassword: z.string(),
				newPassword: PasswordSchema,
			}),
		)
		.output(SuccessResponseSchema),

	settings: oc
		.route({
			method: "GET",
			path: "/users/settings",
			description: "Get current user settings",
		})
		.output(
			z.object({
				id: z.string(),
				email: z.string(),
				username: z.string(),
				email_verified: z.boolean(),
				created_at: z.number(),
				updated_at: z.number(),
			}),
		),

	updateSettings: oc
		.input(
			z.object({
				currentPassword: z.string().optional(),
				newPassword: PasswordSchema.optional(),
			}),
		)
		.output(SuccessResponseSchema),

	deleteAccount: oc
		.input(
			z.object({
				password: z.string(),
				confirmation: z.literal("DELETE"),
			}),
		)
		.output(SuccessResponseSchema),
};
