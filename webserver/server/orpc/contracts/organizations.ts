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
		.route({
			method: "GET",
			path: "/organizations/:id",
			description: "Get organization details",
		})
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
		.route({
			method: "GET",
			path: "/organizations/:organizationId/members/summary",
			description: "Get organization members summary",
		})
		.input(
			z.object({
				organizationId: z.string(),
			}),
		)
		.output(z.array(OrganizationMemberSchema)),

	rules: oc
		.route({
			method: "GET",
			path: "/organizations/:organizationId/rules/summary",
			description: "Get organization rules summary",
		})
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
		.route({
			method: "POST",
			path: "/organizations/accept-invitation",
			description: "Accept organization invitation",
		})
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
					memberCount: z.number(),
					ruleCount: z.number(),
				}),
			}),
		),

	update: oc
		.route({
			method: "PATCH",
			path: "/organizations/:id",
			description: "Update organization",
		})
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
		.route({
			method: "DELETE",
			path: "/organizations/:id",
			description: "Delete organization",
		})
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	removeMember: oc
		.route({
			method: "DELETE",
			path: "/organizations/:organizationId/members/:userId",
			description: "Remove member from organization",
		})
		.input(
			z.object({
				organizationId: z.string(),
				userId: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	inviteMember: oc
		.route({
			method: "POST",
			path: "/organizations/:organizationId/invite",
			description: "Invite member to organization",
		})
		.input(
			z.object({
				organizationId: z.string(),
				email: z.string().email(),
				locale: z.enum(["ja", "en"]).optional(),
			}),
		)
		.output(SuccessResponseSchema),

	leave: oc
		.route({
			method: "POST",
			path: "/organizations/:organizationId/leave",
			description: "Leave organization",
		})
		.input(
			z.object({
				organizationId: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	updateMemberRole: oc
		.route({
			method: "PATCH",
			path: "/organizations/:orgId/members/:memberId/role",
			description: "Update member role in organization",
		})
		.input(
			z.object({
				orgId: z.string(),
				memberId: z.string(),
				role: z.enum(["owner", "member"]),
			}),
		)
		.output(SuccessResponseSchema),

	listMembers: oc
		.route({
			method: "GET",
			path: "/organizations/:orgId/members",
			description: "List organization members",
		})
		.input(
			z.object({
				orgId: z.string(),
			}),
		)
		.output(
			z.object({
				members: z.array(
					z.object({
						id: z.string(),
						username: z.string(),
						email: z.string(),
						role: z.enum(["owner", "member"]),
						joinedAt: z.number(),
					}),
				),
			}),
		),

	getPublicProfile: oc
		.route({
			method: "GET",
			path: "/organizations/:name/profile",
			description: "Get public organization profile information",
		})
		.input(
			z.object({
				name: z.string().min(1),
			}),
		)
		.output(
			z.object({
				organization: z.object({
					id: z.string(),
					name: z.string(),
					displayName: z.string(),
					description: z.string().nullable(),
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
						user: z.object({
							id: z.string(),
							username: z.string(),
						}),
					}),
				),
			}),
		),

	listRules: oc
		.route({
			method: "GET",
			path: "/organizations/:orgId/rules",
			description: "List organization rules",
		})
		.input(
			z.object({
				orgId: z.string(),
				page: z.number().int().positive().default(1),
				pageSize: z.number().int().min(1).max(100).default(10),
			}),
		)
		.output(
			z.object({
				rules: z.array(
					z.object({
						id: z.string(),
						name: z.string(),
						description: z.string().nullable(),
						visibility: z.enum(["public", "private", "team"]),
						isPublished: z.boolean(),
						downloadCount: z.number(),
						starCount: z.number(),
						createdAt: z.number(),
						updatedAt: z.number(),
						user: z.object({
							id: z.string(),
							username: z.string(),
						}),
						latestVersion: z.string(),
					}),
				),
				total: z.number(),
				page: z.number(),
				pageSize: z.number(),
				totalPages: z.number(),
			}),
		),
};
