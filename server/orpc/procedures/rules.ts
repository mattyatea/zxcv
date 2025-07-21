import { ORPCError } from "@orpc/server";
import * as z from "zod";
import { os } from "~/server/orpc";
import {
	dbWithAuth,
	dbWithEmailVerification,
	dbWithOptionalAuth,
} from "~/server/orpc/middleware/combined";
import { parseRulePath, validateRuleOwnership } from "~/server/utils/namespace";

export const rulesProcedures = {
	getByPath: os
		.use(dbWithOptionalAuth)
		.input(
			z.object({
				path: z.string(), // Format: @owner/rulename
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Parse the path
			const parsed = parseRulePath(input.path);
			if (!parsed) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Invalid rule path format. Expected @owner/rulename",
				});
			}

			const { owner, ruleName } = parsed;

			// Validate ownership and get the owner info
			const ownerInfo = await validateRuleOwnership(db, owner);

			// Find the rule
			const rule = await db.rule.findFirst({
				where: {
					name: ruleName,
					...(ownerInfo.userId
						? { userId: ownerInfo.userId, organizationId: null }
						: { organizationId: ownerInfo.organizationId }),
				},
				include: {
					user: {
						select: {
							id: true,
							username: true,
							email: true,
						},
					},
					organization: {
						select: {
							id: true,
							name: true,
							displayName: true,
						},
					},
				},
			});

			if (!rule) {
				throw new ORPCError("NOT_FOUND", {
					message: "Rule not found",
				});
			}

			// Check access permissions
			if (rule.visibility === "private") {
				if (!user) {
					throw new ORPCError("UNAUTHORIZED", {
						message: "Authentication required for private rules",
					});
				}

				// Check if user is the owner
				if (rule.userId === user.id) {
					// Owner can always access
				} else if (rule.organizationId) {
					// Check if user is a member of the organization
					const isMember = await db.organizationMember.findFirst({
						where: {
							organizationId: rule.organizationId,
							userId: user.id,
						},
					});

					if (!isMember) {
						throw new ORPCError("FORBIDDEN", {
							message: "Access denied to private organization rule",
						});
					}
				} else {
					// Not owner and not an organization rule
					throw new ORPCError("FORBIDDEN", {
						message: "Access denied to private rule",
					});
				}
			}

			return {
				...rule,
				author: rule.user,
				tags: rule.tags ? JSON.parse(rule.tags) : [],
			};
		}),

	search: os
		.use(dbWithOptionalAuth)
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
			const { db, user } = context;

			const where: Record<string, unknown> = {};

			// Filter out private rules unless user is logged in and searching for their own rules
			if (!user) {
				// Anonymous users can only see public rules
				where.visibility = "public";
			} else {
				// Logged-in users can see:
				// 1. Public rules
				// 2. Their own private rules
				// 3. Private rules from organizations they belong to
				const orConditions: Record<string, unknown>[] = [
					{ visibility: "public" },
					{ AND: [{ visibility: "private" }, { userId: user.id }] },
				];

				// Get user's organizations
				const userOrganizations = await db.organizationMember.findMany({
					where: { userId: user.id },
					select: { organizationId: true },
				});

				if (userOrganizations.length > 0) {
					orConditions.push({
						AND: [
							{ visibility: "private" },
							{ organizationId: { in: userOrganizations.map((org) => org.organizationId) } },
						],
					});
				}

				where.OR = orConditions;
			}

			if (input.query) {
				// Add query conditions to existing OR conditions
				if (where.OR) {
					where.AND = [
						{ OR: where.OR },
						{
							OR: [{ name: { contains: input.query } }, { description: { contains: input.query } }],
						},
					];
					delete where.OR;
				} else {
					where.OR = [
						{ name: { contains: input.query } },
						{ description: { contains: input.query } },
					];
				}
			}

			if (input.visibility && input.visibility !== "all") {
				// Override the visibility filter if explicitly requested
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
						organization: {
							select: {
								id: true,
								name: true,
								displayName: true,
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
					tags: rule.tags ? JSON.parse(rule.tags) : [],
				})),
				total,
				page: input.page,
				limit: input.limit,
			};
		}),

	get: os
		.use(dbWithOptionalAuth)
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

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
					organization: {
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

			// Check visibility permissions
			if (rule.visibility === "private") {
				// Private rules can only be accessed by:
				// 1. The owner
				// 2. Organization members if it's an organization rule
				if (!user) {
					throw new ORPCError("UNAUTHORIZED", {
						message: "Authentication required for private rules",
					});
				}

				// Check if user is the owner
				if (rule.userId === user.id) {
					// Owner can always access
				} else if (rule.organizationId) {
					// Check if user is a member of the organization
					const isMember = await db.organizationMember.findFirst({
						where: {
							organizationId: rule.organizationId,
							userId: user.id,
						},
					});

					if (!isMember) {
						throw new ORPCError("FORBIDDEN", {
							message: "Access denied to private organization rule",
						});
					}
				} else {
					// Not owner and not an organization rule
					throw new ORPCError("FORBIDDEN", { message: "Access denied to private rule" });
				}
			}
			// Public rules can be accessed by anyone

			return {
				...rule,
				author: rule.user,
				updated_at: rule.updatedAt,
				created_at: rule.createdAt,
				tags: rule.tags ? JSON.parse(rule.tags) : [],
			};
		}),

	create: os
		.use(dbWithAuth)
		.input(
			z.object({
				name: z.string().regex(/^[a-zA-Z0-9_-]+$/),
				description: z.string().optional(),
				visibility: z.enum(["public", "private"]),
				organizationId: z.string().optional(),
				tags: z.array(z.string()),
				content: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;

			// Validate organization settings
			let organizationId = input.organizationId ?? null;

			// If posting to an organization, validate the organization and membership
			if (input.organizationId) {
				const organization = await db.organization.findUnique({
					where: { id: input.organizationId },
				});

				if (!organization) {
					throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
				}

				// Check if user is a member of the organization
				const isMember = await db.organizationMember.findFirst({
					where: {
						organizationId: organization.id,
						userId: user.id,
					},
				});

				if (!isMember) {
					throw new ORPCError("FORBIDDEN", {
						message: "You must be a member of the organization to post rules",
					});
				}

				organizationId = organization.id;
			} else {
				// If no organization is specified, set organizationId to null
				organizationId = null;
			}

			// Check if rule name already exists in the same context (user or organization)
			const existingRule = await db.rule.findFirst({
				where: organizationId
					? {
							name: input.name,
							organizationId: organizationId,
						}
					: {
							name: input.name,
							userId: user.id,
							organizationId: null,
						},
			});

			if (existingRule) {
				throw new ORPCError("CONFLICT", { message: "A rule with this name already exists" });
			}

			const { generateId, hashContent } = await import("~/server/utils/crypto");

			// Generate IDs and hash content
			const ruleId = generateId();
			const versionId = generateId();
			const contentHash = await hashContent(input.content);
			const r2ObjectKey = `rules/${ruleId}/versions/${versionId}/content.md`;

			// Store content in R2
			try {
				console.log("Attempting to store content in R2...");
				console.log("R2 Object Key:", r2ObjectKey);
				console.log("R2 Binding exists:", !!env.R2);

				if (!env.R2) {
					throw new Error("R2 binding not available");
				}

				await env.R2.put(r2ObjectKey, input.content);
				console.log("Successfully stored content in R2");
			} catch (error) {
				console.error("Failed to store content in R2:", error);
				console.error("Error details:", error instanceof Error ? error.message : error);
				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to store content" });
			}

			// Create rule and version records
			try {
				console.log("Creating rule and version records...");
				console.log("Rule data:", {
					id: ruleId,
					name: input.name,
					visibility: input.visibility,
					organizationId: organizationId,
					userId: user.id,
				});

				// Create the rule first (without latestVersionId to avoid foreign key constraint)
				const rule = await db.rule.create({
					data: {
						id: ruleId,
						name: input.name,
						description: input.description,
						visibility: input.visibility,
						organizationId: organizationId || null,
						tags: JSON.stringify(input.tags),
						userId: user.id,
						version: "1.0.0",
						latestVersionId: null,
						createdAt: Math.floor(Date.now() / 1000),
						updatedAt: Math.floor(Date.now() / 1000),
					},
				});

				try {
					// Create the initial version
					const version = await db.ruleVersion.create({
						data: {
							id: versionId,
							ruleId: ruleId,
							versionNumber: "1.0.0",
							contentHash,
							r2ObjectKey,
							createdBy: user.id,
							changelog: null,
							createdAt: Math.floor(Date.now() / 1000),
						},
					});

					// Update the rule with the latestVersionId
					await db.rule.update({
						where: { id: ruleId },
						data: { latestVersionId: versionId },
					});

					console.log("Rule and version created successfully");
					return { id: rule.id };
				} catch (versionError) {
					// If version creation fails, delete the rule
					console.error("Failed to create version, rolling back rule:", versionError);
					await db.rule.delete({ where: { id: ruleId } });
					throw versionError;
				}
			} catch (dbError) {
				console.error("Database operation failed:", dbError);
				console.error("Error details:", dbError instanceof Error ? dbError.message : dbError);

				// Try to clean up R2 if database failed
				try {
					await env.R2.delete(r2ObjectKey);
					console.log("Cleaned up R2 object after database failure");
				} catch (cleanupError) {
					console.error("Failed to clean up R2:", cleanupError);
				}

				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create rule" });
			}
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
				visibility: z.enum(["public", "private"]).optional(),
				organizationId: z.string().optional(),
				tags: z.array(z.string()).optional(),
				content: z.string().optional(),
				changelog: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;

			const existingRule = await db.rule.findUnique({
				where: { id: input.id },
				include: {
					organization: true,
				},
			});

			if (!existingRule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			// Check if user has permission to update
			// 1. Owner can always update
			// 2. Organization members can update organization rules
			let canUpdate = false;

			if (existingRule.userId === user.id) {
				canUpdate = true;
			} else if (existingRule.organizationId) {
				const isMember = await db.organizationMember.findFirst({
					where: {
						organizationId: existingRule.organizationId,
						userId: user.id,
						role: { in: ["owner", "member"] }, // Allow both owners and members to update
					},
				});
				canUpdate = !!isMember;
			}

			if (!canUpdate) {
				throw new ORPCError("FORBIDDEN", {
					message: "You don't have permission to update this rule",
				});
			}

			const { id, tags, content, changelog, ...updateData } = input;

			// ルール名が変更される場合、一意性をチェック
			if (updateData.name && updateData.name !== existingRule.name) {
				const nameExists = await db.rule.findFirst({
					where: {
						name: updateData.name,
						id: { not: id },
						...(existingRule.organizationId
							? { organizationId: existingRule.organizationId }
							: { userId: existingRule.userId, organizationId: null }),
					},
				});

				if (nameExists) {
					throw new ORPCError("CONFLICT", {
						message: "A rule with this name already exists",
					});
				}
			}

			// コンテンツの更新がある場合は新しいバージョンを作成
			if (content) {
				const { generateId, hashContent } = await import("~/server/utils/crypto");

				// 現在のバージョンを取得
				const currentVersion = await db.ruleVersion.findFirst({
					where: {
						ruleId: id,
						versionNumber: existingRule.version,
					},
				});

				if (!currentVersion) {
					throw new ORPCError("NOT_FOUND", { message: "Current version not found" });
				}

				// 現在のコンテンツを取得して比較
				let currentContent = "";
				try {
					const object = await env.R2.get(currentVersion.r2ObjectKey);
					if (object) {
						currentContent = await object.text();
					}
				} catch (error) {
					console.error("Failed to fetch current content:", error);
				}

				// コンテンツが変更されていない場合はメタデータのみ更新
				if (content === currentContent) {
					await db.rule.update({
						where: { id },
						data: {
							...updateData,
							tags: tags ? JSON.stringify(tags) : undefined,
							updatedAt: Math.floor(Date.now() / 1000),
						},
					});
					return { success: true };
				}

				// 新しいバージョン番号を生成（簡易的な実装）
				const versionParts = existingRule.version.split(".");
				const patchVersion = Number.parseInt(versionParts[2]) + 1;
				const newVersionNumber = `${versionParts[0]}.${versionParts[1]}.${patchVersion}`;

				// 新しいバージョンのIDとコンテンツハッシュを生成
				const versionId = generateId();
				const contentHash = await hashContent(content);
				const r2ObjectKey = `rules/${id}/versions/${versionId}/content.md`;

				// R2にコンテンツを保存
				try {
					await env.R2.put(r2ObjectKey, content);
				} catch (error) {
					console.error("Failed to store content in R2:", error);
					throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to store content" });
				}

				// 新しいバージョンを作成
				try {
					await db.ruleVersion.create({
						data: {
							id: versionId,
							ruleId: id,
							versionNumber: newVersionNumber,
							changelog: changelog || "Updated content",
							contentHash,
							r2ObjectKey,
							createdBy: user.id,
							createdAt: Math.floor(Date.now() / 1000),
						},
					});

					// ルールのバージョンとlatestVersionIdを更新
					await db.rule.update({
						where: { id },
						data: {
							...updateData,
							version: newVersionNumber,
							latestVersionId: versionId,
							tags: tags ? JSON.stringify(tags) : undefined,
							updatedAt: Math.floor(Date.now() / 1000),
						},
					});
				} catch (dbError) {
					// R2のクリーンアップ
					try {
						await env.R2.delete(r2ObjectKey);
					} catch (cleanupError) {
						console.error("Failed to clean up R2:", cleanupError);
					}
					throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create new version" });
				}
			} else {
				// コンテンツの更新がない場合は、メタデータのみ更新
				await db.rule.update({
					where: { id },
					data: {
						...updateData,
						tags: tags ? JSON.stringify(tags) : undefined,
						updatedAt: Math.floor(Date.now() / 1000),
					},
				});
			}

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

			if (!rule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			// Check if user has permission to delete
			// 1. Owner can always delete
			// 2. Organization owners can delete organization rules
			let canDelete = false;

			if (rule.userId === user.id) {
				canDelete = true;
			} else if (rule.organizationId) {
				const isMember = await db.organizationMember.findFirst({
					where: {
						organizationId: rule.organizationId,
						userId: user.id,
						role: "owner", // Only organization owners can delete
					},
				});
				canDelete = !!isMember;
			}

			if (!canDelete) {
				throw new ORPCError("FORBIDDEN", {
					message: "You don't have permission to delete this rule",
				});
			}

			await db.rule.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	getContent: os
		.use(dbWithOptionalAuth)
		.input(
			z.object({
				id: z.string(),
				version: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, env, user } = context;
			console.log("getContent called with:", { id: input.id, version: input.version });

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

			// Check visibility permissions
			if (rule.visibility === "private") {
				// Private rules can only be accessed by:
				// 1. The owner
				// 2. Organization members if it's an organization rule
				if (!user) {
					throw new ORPCError("UNAUTHORIZED", {
						message: "Authentication required for private rules",
					});
				}

				// Check if user is the owner
				if (rule.userId === user.id) {
					// Owner can always access
				} else if (rule.organizationId) {
					// Check if user is a member of the organization
					const isMember = await db.organizationMember.findFirst({
						where: {
							organizationId: rule.organizationId,
							userId: user.id,
						},
					});

					if (!isMember) {
						throw new ORPCError("FORBIDDEN", {
							message: "Access denied to private organization rule",
						});
					}
				} else {
					// Not owner and not an organization rule
					throw new ORPCError("FORBIDDEN", { message: "Access denied to private rule" });
				}
			}
			// Public rules can be accessed by anyone

			const version = rule.versions[0];
			console.log("Found versions:", rule.versions.length, version);
			if (!version) {
				throw new ORPCError("NOT_FOUND", { message: "Version not found" });
			}

			// Fetch content from R2
			try {
				console.log("Fetching from R2 with key:", version.r2ObjectKey);
				console.log("R2 binding:", env.R2);
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
				if (error instanceof ORPCError) {
					throw error;
				}
				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to fetch content" });
			}
		}),

	versions: os
		.use(dbWithOptionalAuth)
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

			if (!rule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			// Check visibility permissions for versions
			if (rule.visibility === "private") {
				if (!user) {
					throw new ORPCError("UNAUTHORIZED", {
						message: "Authentication required for private rules",
					});
				}

				// Check if user is the owner or organization member
				if (rule.userId === user.id) {
					// Owner can access
				} else if (rule.organizationId) {
					const isMember = await db.organizationMember.findFirst({
						where: {
							organizationId: rule.organizationId,
							userId: user.id,
						},
					});

					if (!isMember) {
						throw new ORPCError("FORBIDDEN", {
							message: "Access denied to private organization rule",
						});
					}
				} else {
					throw new ORPCError("FORBIDDEN", { message: "Access denied to private rule" });
				}
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
		.use(dbWithOptionalAuth)
		.input(
			z.object({
				id: z.string(),
				limit: z.number().min(1).max(10).default(5),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Get the current rule to find related rules
			const rule = await db.rule.findUnique({
				where: { id: input.id },
			});

			if (!rule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			// Find related rules based on tags or author
			const tags = rule.tags ? JSON.parse(rule.tags) : [];

			// Build visibility conditions based on user
			const visibilityConditions: Record<string, unknown>[] = [{ visibility: "public" }];

			if (user) {
				// If logged in, also include:
				// 1. User's own private rules
				visibilityConditions.push({
					AND: [{ visibility: "private" }, { userId: user.id }],
				});

				// 2. Private rules from user's organizations
				const userOrganizations = await db.organizationMember.findMany({
					where: { userId: user.id },
					select: { organizationId: true },
				});

				if (userOrganizations.length > 0) {
					visibilityConditions.push({
						AND: [
							{ visibility: "private" },
							{ organizationId: { in: userOrganizations.map((org) => org.organizationId) } },
						],
					});
				}
			}

			const relatedRules = await db.rule.findMany({
				where: {
					AND: [
						{ id: { not: input.id } },
						{ OR: visibilityConditions },
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
				visibility: rule.visibility as "public" | "private" | "organization",
				tags: rule.tags ? JSON.parse(rule.tags) : [],
				version: rule.version,
				updated_at: rule.updatedAt,
			}));
		}),
};
