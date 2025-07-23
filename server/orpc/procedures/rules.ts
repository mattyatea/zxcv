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
		.route({
			method: "GET",
			path: "/rules/{path}",
			description: "Get a rule by its path (@owner/rulename)",
		})
		.input(
			z.object({
				path: z.string().describe("Rule path in format @owner/rulename"),
			}),
		)
		.output(
			z.object({
				rule: z.object({
					id: z.string(),
					name: z.string(),
					description: z.string().nullable(),
					content: z.string(),
					tags: z.array(z.string()),
					visibility: z.enum(["public", "private"]),
					publishedAt: z.number().nullable(),
					createdAt: z.number(),
					updatedAt: z.number(),
					owner: z.object({
						id: z.string(),
						username: z.string(),
						type: z.enum(["user", "organization"]),
					}),
				}),
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

			// Format the owner information
			const ownerData =
				rule.organizationId && rule.organization
					? {
							type: "organization" as const,
							id: rule.organization.id,
							username: rule.organization.name,
						}
					: {
							type: "user" as const,
							id: rule.user.id,
							username: rule.user.username,
						};

			return {
				rule: {
					id: rule.id,
					name: rule.name,
					content: "", // Content is fetched separately via getContent endpoint
					description: rule.description,
					visibility: rule.visibility as "public" | "private",
					tags: rule.tags ? JSON.parse(rule.tags) : [],
					owner: ownerData,
					createdAt: rule.createdAt,
					updatedAt: rule.updatedAt,
					publishedAt: rule.publishedAt,
				},
			};
		}),

	search: os
		.use(dbWithOptionalAuth)
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
		.route({
			method: "POST",
			path: "/rules/create",
			description: "Create a new rule",
		})
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
						version: "1.0",
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
							versionNumber: "1.0",
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
		.route({
			method: "POST",
			path: "/rules/update",
			description: "Update a rule",
		})
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
				isMajorVersionUp: z.boolean().optional(),
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

			const { id, tags, content, changelog, isMajorVersionUp, name, ...updateData } = input;

			// ルール名の変更は禁止
			if (name && name !== existingRule.name) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Rule name cannot be changed",
				});
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

				// 既存のバージョンを取得して最新バージョンを特定
				const existingVersions = await db.ruleVersion.findMany({
					where: { ruleId: id },
					select: { versionNumber: true },
					orderBy: { createdAt: "desc" },
				});

				console.log(
					"Existing versions:",
					existingVersions.map((v) => v.versionNumber),
				);

				// バージョン番号を正規化する関数（1.0.0 -> 1.0）
				const normalizeVersion = (version: string): string => {
					const parts = version.split(".");
					const major = Number.parseInt(parts[0]) || 1;
					const minor = Number.parseInt(parts[1]) || 0;
					return `${major}.${minor}`;
				};

				// バージョン番号の比較関数
				const compareVersions = (v1: string, v2: string): number => {
					const norm1 = normalizeVersion(v1);
					const norm2 = normalizeVersion(v2);
					const [major1, minor1] = norm1.split(".").map((n) => Number.parseInt(n) || 0);
					const [major2, minor2] = norm2.split(".").map((n) => Number.parseInt(n) || 0);

					if (major1 !== major2) {
						return major1 - major2;
					}
					return minor1 - minor2;
				};

				// 最新バージョンを取得
				let latestVersion = existingRule.version;
				if (existingVersions.length > 0) {
					latestVersion = existingVersions.reduce((latest, current) => {
						return compareVersions(current.versionNumber, latest) > 0
							? current.versionNumber
							: latest;
					}, existingVersions[0].versionNumber);
				}

				// 新しいバージョン番号を生成
				console.log("Latest version:", latestVersion);
				console.log("isMajorVersionUp:", input.isMajorVersionUp);

				const versionParts = latestVersion.split(".");
				const currentMajorVersion = Number.parseInt(versionParts[0]) || 1;
				const currentMinorVersion = Number.parseInt(versionParts[1]) || 0;

				let newVersionNumber: string;
				if (input.isMajorVersionUp) {
					// メジャーバージョンを手動でインクリメント
					newVersionNumber = `${currentMajorVersion + 1}.0`;
				} else {
					// マイナーバージョンを自動でインクリメント
					newVersionNumber = `${currentMajorVersion}.${currentMinorVersion + 1}`;
				}

				console.log("New version number:", newVersionNumber);

				// 新しいバージョンが既存のバージョンより大きいことを確認
				const versionExists = existingVersions.some((v) => v.versionNumber === newVersionNumber);
				if (versionExists) {
					throw new ORPCError("BAD_REQUEST", {
						message: `バージョン ${newVersionNumber} は既に存在します。`,
					});
				}

				// 最新バージョンより大きいことを確認（バージョンが存在する場合のみ）
				if (existingVersions.length > 0) {
					const latestVersion = existingVersions.reduce((latest, current) => {
						return compareVersions(current.versionNumber, latest.versionNumber) > 0
							? current
							: latest;
					}, existingVersions[0]);

					if (compareVersions(newVersionNumber, latestVersion.versionNumber) <= 0) {
						throw new ORPCError("BAD_REQUEST", {
							message: `新しいバージョン ${newVersionNumber} は最新バージョン ${latestVersion.versionNumber} より大きくなければなりません。`,
						});
					}
				}

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
					console.log("Creating new version with data:", {
						id: versionId,
						ruleId: id,
						versionNumber: newVersionNumber,
						changelog: changelog || null,
						contentHash,
						r2ObjectKey,
						createdBy: user.id,
						createdAt: Math.floor(Date.now() / 1000),
					});

					await db.ruleVersion.create({
						data: {
							id: versionId,
							ruleId: id,
							versionNumber: newVersionNumber,
							changelog: changelog || null,
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
					console.error("Database error creating version:", dbError);
					console.error("Error details:", dbError instanceof Error ? dbError.message : dbError);

					// R2のクリーンアップ
					try {
						await env.R2.delete(r2ObjectKey);
					} catch (cleanupError) {
						console.error("Failed to clean up R2:", cleanupError);
					}

					// エラーメッセージを詳細に
					const errorMessage =
						dbError instanceof Error
							? `Failed to create new version: ${dbError.message}`
							: "Failed to create new version";
					throw new ORPCError("INTERNAL_SERVER_ERROR", { message: errorMessage });
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
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;

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

			// Get all versions before deleting the rule
			const versions = await db.ruleVersion.findMany({
				where: { ruleId: input.id },
				select: { r2ObjectKey: true },
			});

			// Delete from database first (cascade will delete versions)
			await db.rule.delete({
				where: { id: input.id },
			});

			// Clean up R2 storage after successful database deletion
			if (env.R2 && versions.length > 0) {
				try {
					console.log(`Cleaning up ${versions.length} R2 objects for rule ${input.id}`);

					// Delete all version content files from R2
					const deletePromises = versions.map((version) =>
						env.R2.delete(version.r2ObjectKey).catch((error) => {
							console.error(`Failed to delete R2 object ${version.r2ObjectKey}:`, error);
							// Continue with other deletions even if one fails
						}),
					);

					await Promise.all(deletePromises);
					console.log(`Successfully cleaned up R2 objects for rule ${input.id}`);
				} catch (error) {
					// Log error but don't fail the operation since database deletion already succeeded
					console.error("Failed to clean up some R2 objects:", error);
				}
			}

			return { success: true };
		}),

	getContent: os
		.use(dbWithOptionalAuth)
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

	getVersion: os
		.use(dbWithOptionalAuth)
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
		.handler(async ({ input, context }) => {
			const { db, env, user } = context;
			const { id, version: versionNumber } = input;

			// ルールの基本情報を取得
			const rule = await db.rule.findUnique({
				where: { id },
				include: {
					user: {
						select: {
							id: true,
							username: true,
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

			// アクセス権限のチェック
			if (rule.visibility === "private") {
				if (!user) {
					throw new ORPCError("UNAUTHORIZED", {
						message: "Authentication required for private rules",
					});
				}

				if (rule.userId === user.id) {
					// オーナーは常にアクセス可能
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

			// 指定されたバージョンを取得
			const ruleVersion = await db.ruleVersion.findFirst({
				where: {
					ruleId: id,
					versionNumber,
				},
				include: {
					creator: {
						select: {
							id: true,
							username: true,
						},
					},
				},
			});

			if (!ruleVersion) {
				throw new ORPCError("NOT_FOUND", { message: `Version ${versionNumber} not found` });
			}

			// R2からコンテンツを取得
			try {
				const object = await env.R2.get(ruleVersion.r2ObjectKey);
				if (!object) {
					throw new ORPCError("NOT_FOUND", { message: "Version content not found" });
				}

				const content = await object.text();

				return {
					id: rule.id,
					name: rule.name,
					description: rule.description,
					version: ruleVersion.versionNumber,
					content,
					changelog: ruleVersion.changelog || "",
					visibility: rule.visibility,
					tags: rule.tags ? JSON.parse(rule.tags) : [],
					author: rule.user,
					organization: rule.organization,
					createdAt: ruleVersion.createdAt,
					createdBy: ruleVersion.creator,
					isLatest: rule.version === ruleVersion.versionNumber,
				};
			} catch (error) {
				console.error("Failed to fetch version content from R2:", error);
				if (error instanceof ORPCError) {
					throw error;
				}
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to fetch version content",
				});
			}
		}),

	related: os
		.use(dbWithOptionalAuth)
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

	list: os
		.use(dbWithOptionalAuth)
		.route({
			method: "POST",
			path: "/rules/list",
			description: "List rules",
		})
		.input(
			z.object({
				visibility: z.enum(["public", "private", "all"]).optional().default("public"),
				tags: z.array(z.string()).optional(),
				author: z.string().optional(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Build visibility conditions
			const visibilityConditions: Record<string, unknown>[] = [];

			if (input.visibility === "public" || input.visibility === "all") {
				visibilityConditions.push({ visibility: "public" });
			}

			if (user && (input.visibility === "private" || input.visibility === "all")) {
				visibilityConditions.push({
					AND: [{ visibility: "private" }, { userId: user.id }],
				});
			}

			const whereConditions: Record<string, unknown> = {
				OR: visibilityConditions,
			};

			// Add tag filter
			if (input.tags && input.tags.length > 0) {
				whereConditions.AND = whereConditions.AND || [];
				(whereConditions.AND as unknown[]).push({
					OR: input.tags.map((tag) => ({ tags: { contains: tag } })),
				});
			}

			// Add author filter
			if (input.author) {
				whereConditions.user = {
					username: input.author,
				};
			}

			const rules = await db.rule.findMany({
				where: whereConditions,
				include: {
					user: {
						select: {
							id: true,
							username: true,
						},
					},
				},
				orderBy: { updatedAt: "desc" },
				take: input.limit,
				skip: input.offset,
			});

			const totalCount = await db.rule.count({ where: whereConditions });

			return {
				rules: rules.map((rule) => ({
					id: rule.id,
					name: rule.name,
					description: rule.description,
					author: rule.user,
					visibility: rule.visibility,
					tags: rule.tags ? JSON.parse(rule.tags) : [],
					version: rule.version,
					updated_at: rule.updatedAt,
				})),
				total: totalCount,
				limit: input.limit,
				offset: input.offset,
			};
		}),

	like: os
		.use(dbWithAuth)
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
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Check if rule exists
			const rule = await db.rule.findUnique({
				where: { id: input.ruleId },
			});

			if (!rule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			// Check if already starred
			const existingStar = await db.ruleStar.findFirst({
				where: {
					ruleId: input.ruleId,
					userId: user.id,
				},
			});

			if (existingStar) {
				return { success: true, message: "Rule already starred" };
			}

			// Create star
			const { generateId } = await import("~/server/utils/crypto");
			await db.ruleStar.create({
				data: {
					id: generateId(),
					ruleId: input.ruleId,
					userId: user.id,
				},
			});

			return { success: true, message: "Rule liked successfully" };
		}),

	unlike: os
		.use(dbWithAuth)
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
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Check if rule exists
			const rule = await db.rule.findUnique({
				where: { id: input.ruleId },
			});

			if (!rule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			// Remove star
			await db.ruleStar.deleteMany({
				where: {
					ruleId: input.ruleId,
					userId: user.id,
				},
			});

			return { success: true, message: "Rule unliked successfully" };
		}),

	view: os
		.use(dbWithOptionalAuth)
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
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Check if rule exists
			const rule = await db.rule.findUnique({
				where: { id: input.ruleId },
			});

			if (!rule) {
				throw new ORPCError("NOT_FOUND", { message: "Rule not found" });
			}

			// Track download instead of view (using existing model)
			const { generateId } = await import("~/server/utils/crypto");
			await db.ruleDownload.create({
				data: {
					id: generateId(),
					ruleId: input.ruleId,
					userId: user?.id || null,
					ipAddress: "127.0.0.1", // Default for test/dev
					userAgent: "test-client",
				},
			});

			return { success: true, message: "View tracked" };
		}),
};
