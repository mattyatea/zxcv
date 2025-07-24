import { oc } from "@orpc/contract";
import * as z from "zod";
import {
	OrganizationMemberSchema,
	OrganizationNameSchema,
	OrganizationSchema,
	SuccessResponseSchema,
} from "../schemas/common";

export const organizationsContract = {
	list: oc
		.route({
			method: "GET",
			path: "/organizations/list",
			description: "List organizations the authenticated user belongs to",
		})
		.output(
			z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					displayName: z.string(),
					owner: z.object({
						id: z.string(),
						username: z.string(),
						email: z.string(),
					}),
					memberCount: z.number(),
					ruleCount: z.number(),
				}),
			),
		),

	create: oc
		.route({
			method: "POST",
			path: "/organizations",
			description: "Create a new organization",
		})
		.input(
			z.object({
				name: OrganizationNameSchema,
				displayName: z.string().min(1).max(100).optional().describe("Display name"),
				description: z.string().max(500).optional().describe("Organization description"),
				inviteEmails: z.array(z.string().email()).optional().describe("Email addresses to invite"),
			}),
		)
		.output(OrganizationSchema),

	get: oc
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.output(
			z.object({
				id: z.string(),
				name: z.string(),
				displayName: z.string(),
				description: z.string().nullable(),
				owner: z.object({
					id: z.string(),
					username: z.string(),
					email: z.string(),
				}),
				role: z.enum(["owner", "member"]),
				memberCount: z.number(),
				ruleCount: z.number(),
				createdAt: z.number(),
			}),
		),

	members: oc
		.input(
			z.object({
				organizationId: z.string(),
			}),
		)
		.output(z.array(OrganizationMemberSchema)),

	rules: oc
		.input(
			z.object({
				organizationId: z.string(),
			}),
		)
		.output(
			z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					description: z.string().nullable(),
					version: z.string(),
					updatedAt: z.number(),
					author: z.object({
						id: z.string(),
						username: z.string(),
					}),
				}),
			),
		),

	acceptInvitation: oc
		.input(
			z.object({
				token: z.string(),
			}),
		)
		.output(
			SuccessResponseSchema.extend({
				organization: z.object({
					id: z.string(),
					name: z.string(),
					displayName: z.string(),
					description: z.string().nullable(),
					ownerId: z.string(),
					createdAt: z.number(),
					updatedAt: z.number(),
					owner: z.object({
						id: z.string(),
						username: z.string(),
						email: z.string(),
					}),
				}),
			}),
		),

	update: oc
		.input(
			z.object({
				id: z.string(),
				name: OrganizationNameSchema.optional(),
				displayName: z.string().min(1).max(100).optional(),
				description: z.string().max(500).optional(),
			}),
		)
		.output(
			SuccessResponseSchema.extend({
				organization: OrganizationSchema,
			}),
		),

	delete: oc
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	removeMember: oc
		.input(
			z.object({
				organizationId: z.string(),
				userId: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	inviteMember: oc
		.input(
			z.object({
				organizationId: z.string(),
				username: z.string().min(1),
			}),
		)
		.output(SuccessResponseSchema),

	leave: oc
		.input(
			z.object({
				organizationId: z.string(),
			}),
		)
		.output(SuccessResponseSchema),
};