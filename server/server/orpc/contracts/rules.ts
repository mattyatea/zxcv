import { oc } from "@orpc/contract";
import * as z from "zod";
import { RuleNameSchema, RuleVersionSchema, SuccessResponseSchema } from "../schemas/common";
import { RuleSummarySchema, RuleWithRelationsSchema } from "../schemas/rule";

export const rulesContract = {
	getByPath: oc
		.route({
			method: "POST",
			path: "/rules/getByPath",
			description: "Get a rule by its path (@owner/rulename)",
		})
		.input(
			z.object({
				path: z.string().describe("Rule path in format @owner/rulename"),
			}),
		)
		.output(RuleWithRelationsSchema),

	search: oc
		.route({
			method: "POST",
			path: "/rules/search",
			description: "Search rules",
		})
		.input(
			z.object({
				query: z.string().optional(),
				tags: z.array(z.string()).optional(),
				author: z.string().optional(),
				type: z.enum(["rule", "ccsubagents"]).optional(),
				visibility: z.string().optional(),
				contentType: z.enum(["rule", "agent"]).optional(),
				sortBy: z.string().optional(),
				page: z.number().default(1),
				limit: z.number().default(20),
			}),
		)
		.output(
			z.object({
				rules: z.array(
					RuleWithRelationsSchema.extend({
						updated_at: z.number(),
						created_at: z.number(),
					}),
				),
				total: z.number(),
				page: z.number(),
				limit: z.number(),
			}),
		),

	get: oc
		.route({
			method: "POST",
			path: "/rules/get",
			description: "Get a rule by ID",
		})
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.output(
			RuleWithRelationsSchema.extend({
				updated_at: z.number(),
				created_at: z.number(),
			}),
		),

	create: oc
		.route({
			method: "POST",
			path: "/rules/create",
			description: "Create a new rule",
		})
		.input(
			z.object({
				name: RuleNameSchema,
				type: z.enum(["rule", "ccsubagents"]).default("rule"),
				description: z.string().optional(),
				visibility: z.enum(["public", "private"]),
				contentType: z.enum(["rule", "agent"]).default("rule"),
				organizationId: z.string().optional(),
				tags: z.array(z.string()),
				content: z.string(),
			}),
		)
		.output(
			z.object({
				id: z.string(),
			}),
		),

	update: oc
		.route({
			method: "POST",
			path: "/rules/update",
			description: "Update a rule",
		})
		.input(
			z.object({
				id: z.string(),
				name: RuleNameSchema.optional(),
				description: z.string().optional(),
				visibility: z.enum(["public", "private"]).optional(),
				organizationId: z.string().optional(),
				tags: z.array(z.string()).optional(),
				content: z.string().optional(),
				changelog: z.string().optional(),
				isMajorVersionUp: z.boolean().optional(),
			}),
		)
		.output(SuccessResponseSchema),

	delete: oc
		.route({
			method: "POST",
			path: "/rules/delete",
			description: "Delete a rule",
		})
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	getContent: oc
		.route({
			method: "POST",
			path: "/rules/getContent",
			description: "Get rule content",
		})
		.input(
			z.object({
				id: z.string(),
				version: z.string().optional(),
			}),
		)
		.output(
			z.object({
				id: z.string(),
				name: z.string(),
				version: z.string(),
				content: z.string(),
			}),
		),

	versions: oc
		.route({
			method: "POST",
			path: "/rules/versions",
			description: "Get rule versions",
		})
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.output(z.array(RuleVersionSchema)),

	getVersion: oc
		.route({
			method: "POST",
			path: "/rules/getVersion",
			description: "Get specific rule version",
		})
		.input(
			z.object({
				id: z.string(),
				version: z.string(),
			}),
		)
		.output(
			z.object({
				id: z.string(),
				name: z.string(),
				description: z.string().nullable(),
				version: z.string(),
				content: z.string(),
				changelog: z.string(),
				visibility: z.string(),
				tags: z.array(z.string()),
				author: z.object({
					id: z.string(),
					username: z.string(),
				}),
				organization: z
					.object({
						id: z.string(),
						name: z.string(),
						displayName: z.string(),
					})
					.nullable()
					.optional(),
				createdAt: z.number(),
				createdBy: z.object({
					id: z.string(),
					username: z.string(),
				}),
				isLatest: z.boolean(),
			}),
		),

	related: oc
		.route({
			method: "POST",
			path: "/rules/related",
			description: "Get related rules",
		})
		.input(
			z.object({
				id: z.string(),
				limit: z.number().min(1).max(10).default(5),
			}),
		)
		.output(
			z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					description: z.string().nullable(),
					author: z.object({
						id: z.string(),
						username: z.string(),
					}),
					visibility: z.enum(["public", "private", "organization"]),
					tags: z.array(z.string()),
					version: z.string(),
					updated_at: z.number(),
				}),
			),
		),

	list: oc
		.route({
			method: "POST",
			path: "/rules/list",
			description: "List rules",
		})
		.input(
			z.object({
				visibility: z.enum(["public", "private", "all"]).optional().default("public"),
				contentType: z.enum(["rule", "agent"]).optional(),
				tags: z.array(z.string()).optional(),
				author: z.string().optional(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.output(
			z.object({
				rules: z.array(RuleSummarySchema),
				total: z.number(),
				limit: z.number(),
				offset: z.number(),
			}),
		),

	like: oc
		.route({
			method: "POST",
			path: "/rules/like",
			description: "Like a rule",
		})
		.input(
			z.object({
				ruleId: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	unlike: oc
		.route({
			method: "POST",
			path: "/rules/unlike",
			description: "Unlike a rule",
		})
		.input(
			z.object({
				ruleId: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	view: oc
		.route({
			method: "POST",
			path: "/rules/view",
			description: "Record rule view",
		})
		.input(
			z.object({
				ruleId: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	listPublic: oc
		.route({
			method: "POST",
			path: "/rules/listPublic",
			description: "List public rules",
		})
		.input(
			z.object({
				contentType: z.enum(["rule", "agent"]).optional(),
				tags: z.array(z.string()).optional(),
				author: z.string().optional(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.output(
			z.object({
				rules: z.array(RuleSummarySchema),
				total: z.number(),
				limit: z.number(),
				offset: z.number(),
			}),
		),

	star: oc
		.route({
			method: "POST",
			path: "/rules/star",
			description: "Star a rule",
		})
		.input(
			z.object({
				ruleId: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	unstar: oc
		.route({
			method: "POST",
			path: "/rules/unstar",
			description: "Unstar a rule",
		})
		.input(
			z.object({
				ruleId: z.string(),
			}),
		)
		.output(SuccessResponseSchema),

	getVersionHistory: oc
		.route({
			method: "POST",
			path: "/rules/getVersionHistory",
			description: "Get version history of a rule",
		})
		.input(
			z.object({
				ruleId: z.string(),
			}),
		)
		.output(
			z.array(
				z.object({
					version: z.string(),
					changelog: z.string(),
					created_at: z.number(),
					createdBy: z.object({
						id: z.string(),
						username: z.string(),
					}),
				}),
			),
		),

	// デバッグ用エンドポイント
	debug: oc
		.route({
			method: "POST",
			path: "/rules/debug",
			description: "Debug endpoint to check all rules in database",
		})
		.input(z.object({}))
		.output(
			z.object({
				totalRules: z.number(),
				publicRules: z.number(),
				rules: z.array(
					z.object({
						id: z.string(),
						name: z.string(),
						visibility: z.string(),
						userId: z.string().nullable(),
						username: z.string().optional(),
					}),
				),
			}),
		),
};
