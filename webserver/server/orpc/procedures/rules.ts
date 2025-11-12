import { ORPCError } from "@orpc/server";
import type { RuleVersion } from "@prisma/client";
import { RuleService } from "../../services";
import { createLogger } from "../../utils/logger";
import { parseRulePath } from "../../utils/namespace";
import { os } from "../index";
import { authRequiredMiddleware } from "../middleware/auth";
import { dbProvider } from "../middleware/db";

type RuleVersionWithCreator = RuleVersion & {
	creator?: { id: string; username: string } | null;
};

export const rulesProcedures = {
	/**
	 * パスによるルール取得
	 */
	getByPath: os.rules.getByPath
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ input, context }) => {
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
			const { rule, version } = result;

			// Ensure we have the proper author object
			const author = rule.user || {
				id: rule.userId || "",
				username: "Unknown",
				email: "",
				displayName: null,
				avatarUrl: null,
			};

			return {
				id: rule.id,
				name: rule.name,
				userId: rule.userId || null,
				type: rule.type,
				subType: rule.subType || null,
				visibility: rule.visibility as "public" | "private" | "organization",
				description: rule.description,
				tags: rule.tags ? (typeof rule.tags === "string" ? JSON.parse(rule.tags) : rule.tags) : [],
				createdAt: rule.createdAt,
				updatedAt: rule.updatedAt,
				publishedAt: rule.publishedAt,
				version: version.versionNumber || rule.version || "1.0.0",
				latestVersionId: rule.latestVersionId || version.id,
				views: rule.views,
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
	create: os.rules.create
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ input, context }) => {
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
	update: os.rules.update
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			const { id, ...updateData } = input;
			await ruleService.updateRule(id, user.id, updateData);
			return { success: true, message: "Rule updated successfully" };
		}),

	/**
	 * ルール一覧
	 */
	list: os.rules.list.use(dbProvider).handler(async ({ input, context }) => {
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
	search: os.rules.search.use(dbProvider).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		// Map contract inputs to service method
		return await ruleService.searchRules({
			query: input.query,
			tags: input.tags,
			author: input.author,
			type: input.type,
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
	like: os.rules.like
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.starRule(input.ruleId, user.id);
		}),

	/**
	 * ルールのLikeを解除
	 */
	unlike: os.rules.unlike
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.unstarRule(input.ruleId, user.id);
		}),

	/**
	 * ルールをIDで取得
	 */
	get: os.rules.get.use(dbProvider).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		const rule = await ruleService.getRuleById(input.id, user?.id);

		// Ensure we have the proper author object
		const author = rule.user || {
			id: rule.userId || "",
			username: "Unknown",
			email: "",
			displayName: null,
			avatarUrl: null,
		};

		return {
			id: rule.id,
			name: rule.name,
			userId: rule.userId || null,
			type: rule.type,
			subType: rule.subType || null,
			visibility: rule.visibility as "public" | "private" | "organization",
			description: rule.description,
			tags: rule.tags ? (typeof rule.tags === "string" ? JSON.parse(rule.tags) : rule.tags) : [],
			createdAt: rule.createdAt,
			updatedAt: rule.updatedAt,
			publishedAt: rule.publishedAt,
			version: rule.version || "1.0.0",
			latestVersionId: rule.latestVersionId,
			views: rule.views,
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
	getContent: os.rules.getContent.use(dbProvider).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		return await ruleService.getRuleContent(input.id, input.version, user?.id);
	}),

	/**
	 * ルールのバージョン一覧を取得
	 */
	versions: os.rules.versions.use(dbProvider).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		const versions = await ruleService.getRuleVersions(input.id, user?.id);

		// Creator information is already included from the repository
		return versions.map((v: RuleVersionWithCreator) => ({
			version: v.versionNumber,
			changelog: v.changelog || "",
			created_at: v.createdAt,
			createdBy: v.creator || { id: v.createdBy, username: "Unknown" },
		}));
	}),

	/**
	 * ルールの特定バージョンを取得
	 */
	getVersion: os.rules.getVersion.use(dbProvider).handler(async ({ input, context }) => {
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
	related: os.rules.related.use(dbProvider).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		return await ruleService.getRelatedRules(input.id, input.limit, user?.id);
	}),

	/**
	 * ルールの閲覧を記録
	 */
	view: os.rules.view.use(dbProvider).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const ruleService = new RuleService(db, env.R2, env);

		return await ruleService.recordView(input.ruleId, user?.id);
	}),

	/**
	 * ルールを削除
	 */
	delete: os.rules.delete
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			const result = await ruleService.deleteRule(input.id, user.id);
			return { success: true, message: result.message };
		}),

	/**
	 * 公開ルール一覧
	 */
	listPublic: os.rules.listPublic.use(dbProvider).handler(async ({ input, context }) => {
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
	star: os.rules.star
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.starRule(input.ruleId, user.id);
		}),

	/**
	 * ルールのスターを解除
	 */
	unstar: os.rules.unstar
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.unstarRule(input.ruleId, user.id);
		}),

	/**
	 * ルールのバージョン履歴を取得
	 */
	getVersionHistory: os.rules.getVersionHistory
		.use(dbProvider)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			const versions = await ruleService.getRuleVersions(input.ruleId, user?.id);

			// Creator information is already included from the repository
			return versions.map((v: RuleVersionWithCreator) => ({
				version: v.versionNumber,
				changelog: v.changelog || "",
				created_at: v.createdAt,
				createdBy: v.creator || { id: v.createdBy, username: "Unknown" },
			}));
		}),

	// デバッグ用エンドポイント
	debug: os.rules.debug
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ context }) => {
			const { db, env } = context;

			// Only allow debug endpoint in non-production environments
			if (env.ENVIRONMENT === "production") {
				throw new ORPCError("FORBIDDEN", {
					message: "Debug endpoint is not available in production",
				});
			}

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
					visibility: rule.visibility as "public" | "private" | "organization",
					userId: rule.userId,
					username: rule.user?.username,
				})),
			};
		}),
};
