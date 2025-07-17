import type { Prisma } from "@prisma/client";
import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import type { Env } from "../../types/env";
import { createPrismaClient } from "../../utils/prisma";

export class SearchRulesEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Rules", "Search"],
		summary: "Search rules",
		security: [{ bearerAuth: [] }],
		request: {
			query: z.object({
				q: z.string().optional(),
				tags: z.string().optional(),
				author: z.string().optional(),
				org: z.string().optional(),
				visibility: z.enum(["public", "private", "team", "all"]).optional().default("all"),
				sort: z.enum(["relevance", "updated", "created", "name"]).optional().default("relevance"),
				order: z.enum(["asc", "desc"]).optional().default("desc"),
				limit: z.number().min(1).max(100).optional().default(20),
				offset: z.number().min(0).optional().default(0),
			}),
		},
		responses: {
			"200": {
				description: "Search results",
				content: {
					"application/json": {
						schema: z.object({
							results: z.array(
								z.object({
									id: z.string(),
									name: z.string(),
									org: z.string().optional(),
									visibility: z.string(),
									description: z.string().optional(),
									tags: z.array(z.string()).optional(),
									version: z.string(),
									author: z.object({
										id: z.string(),
										username: z.string(),
									}),
									created_at: z.number(),
									updated_at: z.number(),
								}),
							),
							total: z.number(),
							limit: z.number(),
							offset: z.number(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { q, tags, author, org, visibility, sort, order, limit, offset } = data.query;

		const env = c.env as Env;
		const user = c.get("user");
		const prisma = createPrismaClient(env.DB);

		try {
			// Build where conditions
			const whereConditions: Prisma.RuleWhereInput[] = [];

			// Visibility filter
			if (visibility !== "all") {
				whereConditions.push({ visibility: visibility });
			} else if (user) {
				// User can see: public rules, their own private rules, and team rules they're a member of
				whereConditions.push({
					OR: [
						{ visibility: "public" },
						{ visibility: "team" },
						{
							AND: [{ visibility: "private" }, { userId: user.id }],
						},
					],
				});
			} else {
				// Non-authenticated users can only see public rules
				whereConditions.push({ visibility: "public" });
			}

			// Text search
			if (q) {
				whereConditions.push({
					OR: [{ name: { contains: q } }, { description: { contains: q } }],
				});
			}

			// Tag filter - for JSON array stored as text, we need to use raw query
			if (tags) {
				const tagList = tags.split(",").map((t) => t.trim());
				const tagConditions = tagList.map((tag) => ({
					tags: { contains: `"${tag}"` },
				}));
				whereConditions.push({ OR: tagConditions });
			}

			// Author filter
			if (author) {
				whereConditions.push({
					user: {
						username: author,
					},
				});
			}

			// Organization filter
			if (org) {
				whereConditions.push({ org: org });
			}

			// Combine all conditions
			const where: Prisma.RuleWhereInput =
				whereConditions.length > 0 ? { AND: whereConditions } : {};

			// Determine sort field
			let orderBy: Prisma.RuleOrderByWithRelationInput;
			switch (sort) {
				case "updated":
					orderBy = { updatedAt: order };
					break;
				case "created":
					orderBy = { createdAt: order };
					break;
				case "name":
					orderBy = { name: order };
					break;
				default:
					// For relevance, we'll use updated_at as a proxy
					orderBy = { updatedAt: order };
			}

			// Get results with pagination
			const [rules, totalCount] = await Promise.all([
				prisma.rule.findMany({
					where,
					orderBy,
					skip: offset,
					take: limit,
					include: {
						user: {
							select: {
								id: true,
								username: true,
							},
						},
					},
				}),
				prisma.rule.count({ where }),
			]);

			// Filter out team rules that the user doesn't have access to
			let filteredResults = rules;
			let adjustedTotal = totalCount;

			if (user && (visibility === "all" || visibility === "team")) {
				// Get all unique team IDs for batch checking
				const teamIds = new Set<string>();
				for (const rule of rules) {
					if (rule.visibility === "team" && rule.teamId && rule.userId !== user.id) {
						teamIds.add(rule.teamId);
					}
				}

				// Batch check team memberships
				const userTeams = new Set<string>();
				if (teamIds.size > 0) {
					const memberships = await prisma.teamMember.findMany({
						where: {
							userId: user.id,
							teamId: { in: Array.from(teamIds) },
						},
						select: { teamId: true },
					});
					for (const membership of memberships) {
						userTeams.add(membership.teamId);
					}
				}

				// Filter rules based on batch-checked team memberships
				filteredResults = rules.filter(
					(rule: { visibility: string; teamId: string | null; userId: string }) => {
						if (rule.visibility === "team" && rule.teamId && rule.userId !== user.id) {
							return userTeams.has(rule.teamId);
						}
						return true;
					},
				);

				// Adjust total count to reflect filtered results
				adjustedTotal = totalCount - (rules.length - filteredResults.length);
			} else if (!user && visibility === "team") {
				// Non-authenticated users can't see team rules
				filteredResults = [];
				adjustedTotal = 0;
			}

			return c.json({
				results: filteredResults.map(
					(r: {
						id: any;
						name: any;
						org: any;
						visibility: any;
						description: any;
						tags: string | null;
						version: any;
						user: { id: any; username: any };
						createdAt: any;
						updatedAt: any;
					}) => ({
						id: r.id,
						name: r.name,
						org: r.org || undefined,
						visibility: r.visibility,
						description: r.description || undefined,
						tags: r.tags ? JSON.parse(r.tags) : undefined,
						version: r.version,
						author: {
							id: r.user.id,
							username: r.user.username,
						},
						created_at: r.createdAt,
						updated_at: r.updatedAt,
					}),
				),
				total: adjustedTotal,
				limit,
				offset,
			});
		} catch (_error) {
			// console.error("Error searching rules:", error);
			return c.json({ error: "Failed to search rules" }, 500 as const);
		}
	}
}
