import { oc } from "@orpc/contract";
import * as z from "zod";
import {
	FullUserProfileSchema,
	PasswordSchema,
	SuccessResponseSchema,
	UserWithStatsSchema,
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
					displayName: z.string().nullable(),
					bio: z.string().nullable(),
					location: z.string().nullable(),
					website: z.string().nullable(),
					avatarUrl: z.string().nullable(),
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

	getPublicProfile: oc
		.route({
			method: "GET",
			path: "/users/:username/profile",
			description: "Get public user profile information",
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
					displayName: z.string().nullable(),
					bio: z.string().nullable(),
					location: z.string().nullable(),
					website: z.string().nullable(),
					avatarUrl: z.string().nullable(),
					createdAt: z.number(),
				}),
				stats: z.object({
					publicRulesCount: z.number(),
					totalStars: z.number(),
				}),
				publicRules: z.array(
					z.object({
						id: z.string(),
						name: z.string(),
						description: z.string(),
						stars: z.number(),
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

	me: oc
		.route({
			method: "GET",
			path: "/users/me",
			description: "Get current user information",
		})
		.output(UserWithStatsSchema),

	updateProfile: oc
		.route({
			method: "POST",
			path: "/users/updateProfile",
			description: "Update user profile information",
		})
		.input(
			z.object({
				displayName: z.string().max(100).optional(),
				bio: z.string().max(500).optional(),
				location: z.string().max(100).optional(),
				website: z.string().url().optional().or(z.literal("")),
			}),
		)
		.output(
			z.object({
				user: FullUserProfileSchema,
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

	uploadAvatar: oc
		.route({
			method: "POST",
			path: "/users/uploadAvatar",
			description: "Upload user avatar image",
		})
		.input(
			z.object({
				image: z.string().describe("Base64 encoded image data"),
				filename: z.string().describe("Original filename"),
			}),
		)
		.output(
			z.object({
				avatarUrl: z.string(),
			}),
		),

	deleteAccount: oc
		.input(
			z.object({
				password: z.string(),
				confirmation: z.literal("DELETE"),
			}),
		)
		.output(SuccessResponseSchema),
};
