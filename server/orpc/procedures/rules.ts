import { ORPCError } from "@orpc/server";
import * as z from "zod";
import { os } from "~/server/orpc";
import { dbWithAuth, dbWithEmailVerification } from "~/server/orpc/middleware/combined";
import { dbProvider } from "~/server/orpc/middleware/db";

export const rulesProcedures = {
	search: os
		.use(dbProvider)
		.input(
			z.object({
				query: z.string().optional(),
				tags: z.array(z.string()).optional(),
				author: z.string().optional(),
				visibility: z.string().optional(),
				sortBy: z.string().optional(),
				page: z.number().default(1),
				limit: z.number().default(20),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db } = context;

			const where: Record<string, unknown> = {};

			if (input.query) {
				where.OR = [
					{ name: { contains: input.query } },
					{ description: { contains: input.query } },
				];
			}

			if (input.visibility && input.visibility !== "all") {
				where.visibility = input.visibility;
			}

			if (input.tags && input.tags.length > 0) {
				where.tags = {
					hasSome: input.tags,
				};
			}

			if (input.author) {
				where.user = {
					username: input.author,
				};
			}

			let orderBy: Record<string, string> = {};
			switch (input.sortBy) {
				case "downloads":
					orderBy = { downloads: "desc" };
					break;
				case "created":
					orderBy = { createdAt: "desc" };
					break;
				case "name":
					orderBy = { name: "asc" };
					break;
				default:
					orderBy = { updatedAt: "desc" };
			}

			const [rules, total] = await Promise.all([
				db.rule.findMany({
					where,
					orderBy,
					skip: (input.page - 1) * input.limit,
					take: input.limit,
					include: {
						user: {
							select: {
								id: true,
								username: true,
								email: true,
							},
						},
					},
				}),
				db.rule.count({ where }),
			]);

			return {
				rules: rules.map((rule) => ({
					...rule,
					author: rule.user,
					updated_at: rule.updatedAt,
					created_at: rule.createdAt,
				})),
				total,
				page: input.page,
				limit: input.limit,
			};
		}),

	get: os
		.use(dbProvider)
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db } = context;

			const rule = await db.rule.findUnique({
				where: { id: input.id },
				include: {
					user: {
						select: {
							id: true,
							username: true,
							email: true,
						},
					},
					team: {
						select: {
							id: true,
							name: true,
							displayName: true,
						},
					},
				},
			});

			if (!rule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			return {
				...rule,
				author: rule.user,
				updated_at: rule.updatedAt,
				created_at: rule.createdAt,
			};
		}),

	create: os
		.use(dbWithAuth)
		.input(
			z.object({
				name: z.string().regex(/^[a-zA-Z0-9_-]+$/),
				org: z
					.string()
					.regex(/^[a-zA-Z0-9_-]*$/)
					.optional(),
				description: z.string().optional(),
				visibility: z.enum(["public", "private", "team"]),
				teamId: z.string().optional(),
				tags: z.array(z.string()),
				content: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Check if rule name already exists
			const existingRule = await db.rule.findFirst({
				where: {
					name: input.name,
					userId: user.id,
				},
			});

			if (existingRule) {
				throw new ORPCError("CONFLICT", { message: "A rule with this name already exists" });
			}

			const { generateId } = await import("~/server/utils/crypto");
			const rule = await db.rule.create({
				data: {
					id: generateId(),
					name: input.name,
					org: input.org,
					description: input.description,
					visibility: input.visibility,
					teamId: input.teamId,
					tags: JSON.stringify(input.tags),
					userId: user.id,
					version: "1.0.0",
					createdAt: Math.floor(Date.now() / 1000),
					updatedAt: Math.floor(Date.now() / 1000),
				},
			});

			return { id: rule.id };
		}),

	update: os
		.use(dbWithEmailVerification)
		.input(
			z.object({
				id: z.string(),
				name: z
					.string()
					.regex(/^[a-zA-Z0-9_-]+$/)
					.optional(),
				description: z.string().optional(),
				visibility: z.enum(["public", "private", "team"]).optional(),
				teamId: z.string().optional(),
				tags: z.array(z.string()).optional(),
				content: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			const existingRule = await db.rule.findUnique({
				where: { id: input.id },
			});

			if (!existingRule || existingRule.userId !== user.id) {
				throw new ORPCError("FORBIDDEN", { message: "Rule not found or unauthorized" });
			}

			const { id, tags, ...updateData } = input;

			const _rule = await db.rule.update({
				where: { id },
				data: {
					...updateData,
					tags: tags ? JSON.stringify(tags) : undefined,
					updatedAt: Math.floor(Date.now() / 1000),
				},
			});

			return { success: true };
		}),

	delete: os
		.use(dbWithEmailVerification)
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			const rule = await db.rule.findUnique({
				where: { id: input.id },
			});

			if (!rule || rule.userId !== user.id) {
				throw new ORPCError("FORBIDDEN", { message: "Rule not found or unauthorized" });
			}

			await db.rule.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	getContent: os
		.use(dbProvider)
		.input(
			z.object({
				id: z.string(),
				version: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, env } = context;

			// First get the rule to determine the version
			const baseRule = await db.rule.findUnique({
				where: { id: input.id },
			});

			if (!baseRule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			// Now get the rule with the appropriate version
			const rule = await db.rule.findUnique({
				where: { id: input.id },
				include: {
					versions: {
						where: {
							versionNumber: input.version || baseRule.version,
						},
						take: 1,
					},
				},
			});

			if (!rule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			// TODO: Check visibility permissions
			// if (rule.visibility === "private" && rule.userId !== user?.id) {
			//   throw new ORPCError("FORBIDDEN", { message: "Access denied" });
			// }

			const version = rule.versions[0];
			if (!version) {
				throw new ORPCError("NOT_FOUND", { message: "Version not found" });
			}

			// Fetch content from R2
			try {
				const object = await env.R2.get(version.r2ObjectKey);
				if (!object) {
					throw new ORPCError("NOT_FOUND", { message: "Content not found" });
				}

				const content = await object.text();
				return {
					id: rule.id,
					name: rule.name,
					version: version.versionNumber,
					content,
				};
			} catch (error) {
				console.error("Failed to fetch content from R2:", error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch content" });
			}
		}),

	versions: os
		.use(dbProvider)
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db } = context;

			const rule = await db.rule.findUnique({
				where: { id: input.id },
			});

			if (!rule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			const versions = await db.ruleVersion.findMany({
				where: { ruleId: input.id },
				include: {
					creator: {
						select: {
							id: true,
							username: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			return versions.map((version) => ({
				version: version.versionNumber,
				changelog: version.changelog || "",
				created_at: version.createdAt,
				createdBy: version.creator,
			}));
		}),

	related: os
		.use(dbProvider)
		.input(
			z.object({
				id: z.string(),
				limit: z.number().min(1).max(10).default(5),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db } = context;

			// Get the current rule to find related rules
			const rule = await db.rule.findUnique({
				where: { id: input.id },
			});

			if (!rule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			// Find related rules based on tags or author
			const tags = rule.tags ? JSON.parse(rule.tags) : [];
			const relatedRules = await db.rule.findMany({
				where: {
					AND: [
						{ id: { not: input.id } },
						{ visibility: "public" },
						{
							OR: [
								// Same author
								{ userId: rule.userId },
								// Similar tags
								...(tags.length > 0
									? tags.map((tag: string) => ({
											tags: { contains: tag },
										}))
									: []),
							],
						},
					],
				},
				include: {
					user: {
						select: {
							id: true,
							username: true,
						},
					},
				},
				take: input.limit,
				orderBy: [{ downloads: "desc" }, { updatedAt: "desc" }],
			});

			return relatedRules.map((rule) => ({
				id: rule.id,
				name: rule.name,
				description: rule.description,
				author: rule.user,
				visibility: rule.visibility as "public" | "private" | "team",
				tags: rule.tags ? JSON.parse(rule.tags) : [],
				version: rule.version,
				updated_at: rule.updatedAt,
			}));
		}),
};
