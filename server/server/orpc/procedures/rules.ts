import { ORPCError } from "@orpc/server";
import { nanoid } from "nanoid";
import { RuleService } from "../../services/RuleService";
import { createLogger } from "../../utils/logger";
import { parseRulePath } from "../../utils/namespace";
import { os } from "../index";
import { dbWithAuth, dbWithEmailVerification, dbWithOptionalAuth } from "../middleware/combined";

export const rulesProcedures = {
	/**
	 * パスによるルール取得
	 */
	getByPath: os.rules.getByPath.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		// パスをパース
		const parsed = parseRulePath(input.path);

		if (!parsed) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Invalid rule path format. Expected @owner/rulename or rulename",
			});
		}

		const { owner, ruleName } = parsed;

		const result = await ruleService.getRule(ruleName, owner, user?.id);
		const { rule, version, content } = result;

		// Ensure we have the proper author object
		const author = rule.user || { id: rule.userId || "", username: "Unknown", email: "" };

		return {
			id: rule.id,
			name: rule.name,
			userId: rule.userId || null,
			visibility: rule.visibility,
			description: rule.description,
			tags: rule.tags ? (typeof rule.tags === "string" ? JSON.parse(rule.tags) : rule.tags) : [],
			createdAt: rule.createdAt,
			updatedAt: rule.updatedAt,
			publishedAt: rule.publishedAt,
			version: version.versionNumber || rule.version || "1.0.0",
			latestVersionId: rule.latestVersionId || version.id,
			downloads: rule.downloads,
			stars: rule.stars,
			organizationId: rule.organizationId,
			user: rule.user || author,
			organization: rule.organization || null,
			author,
		};
	}),

	/**
	 * ルール作成
	 */
	create: os.rules.create.use(dbWithEmailVerification).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		const logger = createLogger(env);
		logger.debug("Create rule handler - user", { user });
		const result = await ruleService.createRule(user.id, input);
		return { id: result.rule.id };
	}),

	/**
	 * ルール更新
	 */
	update: os.rules.update.use(dbWithAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		const { id, ...updateData } = input;
		await ruleService.updateRule(id, user.id, updateData);
		return { success: true, message: "Rule updated successfully" };
	}),

	/**
	 * ルール一覧
	 */
	list: os.rules.list.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		// Map contract inputs to service method
		return await ruleService.listRules({
			visibility: input.visibility,
			tags: input.tags,
			author: input.author,
			limit: input.limit,
			offset: input.offset,
			userId: user?.id,
		});
	}),

	/**
	 * ルール検索
	 */
	search: os.rules.search.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		// Map contract inputs to service method
		return await ruleService.searchRules({
			query: input.query,
			tags: input.tags,
			author: input.author,
			visibility: input.visibility,
			sortBy: input.sortBy,
			page: input.page,
			limit: input.limit,
			userId: user?.id,
		});
	}),

	/**
	 * ルールをLike
	 */
	like: os.rules.like.use(dbWithAuth).handler(async ({ input, context }) => {
		const { db, user } = context;

		// ルールが存在するか確認
		const rule = await db.rule.findUnique({
			where: { id: input.ruleId },
		});

		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "Rule not found",
			});
		}

		// 既にLikeしているか確認
		const existingLike = await db.ruleStar.findUnique({
			where: {
				// biome-ignore lint/style/useNamingConvention: Prisma compound key
				ruleId_userId: {
					ruleId: input.ruleId,
					userId: user.id,
				},
			},
		});

		if (existingLike) {
			throw new ORPCError("CONFLICT", {
				message: "Already liked this rule",
			});
		}

		// Likeを追加
		await db.ruleStar.create({
			data: {
				id: nanoid(),
				ruleId: input.ruleId,
				userId: user.id,
				createdAt: Math.floor(Date.now() / 1000),
			},
		});

		// スター数を増やす
		await db.rule.update({
			where: { id: input.ruleId },
			data: { stars: { increment: 1 } },
		});

		return { success: true, message: "Rule liked successfully" };
	}),

	/**
	 * ルールのLikeを解除
	 */
	unlike: os.rules.unlike.use(dbWithAuth).handler(async ({ input, context }) => {
		const { db, user } = context;

		// Likeが存在するか確認
		const existingLike = await db.ruleStar.findUnique({
			where: {
				// biome-ignore lint/style/useNamingConvention: Prisma compound key
				ruleId_userId: {
					ruleId: input.ruleId,
					userId: user.id,
				},
			},
		});

		if (!existingLike) {
			throw new ORPCError("NOT_FOUND", {
				message: "Like not found",
			});
		}

		// Likeを削除
		await db.ruleStar.delete({
			where: {
				// biome-ignore lint/style/useNamingConvention: Prisma compound key
				ruleId_userId: {
					ruleId: input.ruleId,
					userId: user.id,
				},
			},
		});

		// スター数を減らす
		await db.rule.update({
			where: { id: input.ruleId },
			data: { stars: { decrement: 1 } },
		});

		return { success: true, message: "Rule unliked successfully" };
	}),

	/**
	 * ルールをIDで取得
	 */
	get: os.rules.get.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		const rule = await ruleService.getRuleById(input.id, user?.id);

		// Ensure we have the proper author object
		const author = rule.user || { id: rule.userId || "", username: "Unknown", email: "" };

		return {
			id: rule.id,
			name: rule.name,
			userId: rule.userId || null,
			visibility: rule.visibility,
			description: rule.description,
			tags: rule.tags ? (typeof rule.tags === "string" ? JSON.parse(rule.tags) : rule.tags) : [],
			createdAt: rule.createdAt,
			updatedAt: rule.updatedAt,
			publishedAt: rule.publishedAt,
			version: rule.version || "1.0.0",
			latestVersionId: rule.latestVersionId,
			downloads: rule.downloads,
			stars: rule.stars,
			organizationId: rule.organizationId,
			user: rule.user || author,
			organization: rule.organization || null,
			author,
			created_at: rule.createdAt,
			updated_at: rule.updatedAt,
		};
	}),

	/**
	 * ルールのコンテンツを取得
	 */
	getContent: os.rules.getContent.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		return await ruleService.getRuleContent(input.id, input.version, user?.id);
	}),

	/**
	 * ルールのバージョン一覧を取得
	 */
	versions: os.rules.versions.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		const versions = await ruleService.getRuleVersions(input.id, user?.id);

		// Get creator information for each version
		return await Promise.all(
			versions.map(async (v) => {
				const creator = await db.user.findUnique({
					where: { id: v.createdBy },
					select: { id: true, username: true },
				});
				return {
					version: v.versionNumber,
					changelog: v.changelog || "",
					created_at: v.createdAt,
					createdBy: creator || { id: v.createdBy, username: "Unknown" },
				};
			}),
		);
	}),

	/**
	 * ルールの特定バージョンを取得
	 */
	getVersion: os.rules.getVersion.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		const versionData = await ruleService.getRuleVersion(input.id, input.version, user?.id);

		// Ensure proper format for author and createdBy
		const author = versionData.author
			? {
					id: versionData.author.id,
					username: versionData.author.username,
					email: versionData.author.email || "",
				}
			: { id: "", username: "Unknown", email: "" };

		const createdBy = versionData.createdBy
			? {
					id: versionData.createdBy.id,
					username: versionData.createdBy.username || "Unknown",
				}
			: { id: "", username: "Unknown" };

		return {
			...versionData,
			changelog: versionData.changelog || "",
			tags: Array.isArray(versionData.tags) ? versionData.tags : [],
			author,
			createdBy,
		};
	}),

	/**
	 * 関連ルールを取得
	 */
	related: os.rules.related.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		return await ruleService.getRelatedRules(input.id, input.limit, user?.id);
	}),

	/**
	 * ルールの閲覧を記録
	 */
	view: os.rules.view.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		return await ruleService.recordView(input.ruleId, user?.id);
	}),

	/**
	 * ルールを削除
	 */
	delete: os.rules.delete.use(dbWithAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		const result = await ruleService.deleteRule(input.id, user.id);
		return { success: true, message: result.message };
	}),

	/**
	 * 公開ルール一覧
	 */
	listPublic: os.rules.listPublic.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		return await ruleService.listRules({
			visibility: "public",
			tags: input.tags,
			author: input.author,
			limit: input.limit,
			offset: input.offset,
			userId: user?.id,
		});
	}),

	/**
	 * ルールをスター
	 */
	star: os.rules.star.use(dbWithAuth).handler(async ({ input, context }) => {
		// Re-implement star logic instead of calling like handler
		const { db, user } = context;

		// ルールが存在するか確認
		const rule = await db.rule.findUnique({
			where: { id: input.ruleId },
		});

		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "Rule not found",
			});
		}

		// 既にLikeしているか確認
		const existingLike = await db.ruleStar.findUnique({
			where: {
				// biome-ignore lint/style/useNamingConvention: Prisma compound key
				ruleId_userId: {
					ruleId: input.ruleId,
					userId: user.id,
				},
			},
		});

		if (existingLike) {
			throw new ORPCError("CONFLICT", {
				message: "Already liked this rule",
			});
		}

		// Likeを追加
		await db.ruleStar.create({
			data: {
				id: nanoid(),
				ruleId: input.ruleId,
				userId: user.id,
				createdAt: Math.floor(Date.now() / 1000),
			},
		});

		// スター数を増やす
		await db.rule.update({
			where: { id: input.ruleId },
			data: { stars: { increment: 1 } },
		});

		return { success: true, message: "Rule starred successfully" };
	}),

	/**
	 * ルールのスターを解除
	 */
	unstar: os.rules.unstar.use(dbWithAuth).handler(async ({ input, context }) => {
		// Re-implement unstar logic instead of calling unlike handler
		const { db, user } = context;

		// Likeが存在するか確認
		const existingLike = await db.ruleStar.findUnique({
			where: {
				// biome-ignore lint/style/useNamingConvention: Prisma compound key
				ruleId_userId: {
					ruleId: input.ruleId,
					userId: user.id,
				},
			},
		});

		if (!existingLike) {
			throw new ORPCError("NOT_FOUND", {
				message: "Like not found",
			});
		}

		// Likeを削除
		await db.ruleStar.delete({
			where: {
				// biome-ignore lint/style/useNamingConvention: Prisma compound key
				ruleId_userId: {
					ruleId: input.ruleId,
					userId: user.id,
				},
			},
		});

		// スター数を減らす
		await db.rule.update({
			where: { id: input.ruleId },
			data: { stars: { decrement: 1 } },
		});

		return { success: true, message: "Rule unstarred successfully" };
	}),

	/**
	 * ルールのバージョン履歴を取得
	 */
	getVersionHistory: os.rules.getVersionHistory
		.use(dbWithOptionalAuth)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			const versions = await ruleService.getRuleVersions(input.ruleId, user?.id);

			// Get creator information for each version
			return await Promise.all(
				versions.map(async (v) => {
					const creator = await db.user.findUnique({
						where: { id: v.createdBy },
						select: { id: true, username: true },
					});
					return {
						version: v.versionNumber,
						changelog: v.changelog || "",
						created_at: v.createdAt,
						createdBy: creator || { id: v.createdBy, username: "Unknown" },
					};
				}),
			);
		}),

	// デバッグ用エンドポイント
	debug: os.rules.debug.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db } = context;

		// すべてのルールを取得
		const allRules = await db.rule.findMany({
			include: {
				user: {
					select: {
						username: true,
					},
				},
			},
		});

		// パブリックルールの数をカウント
		const publicRules = allRules.filter((rule) => rule.visibility === "public").length;

		return {
			totalRules: allRules.length,
			publicRules,
			rules: allRules.map((rule) => ({
				id: rule.id,
				name: rule.name,
				visibility: rule.visibility,
				userId: rule.userId,
				username: rule.user?.username,
			})),
		};
	}),
};
