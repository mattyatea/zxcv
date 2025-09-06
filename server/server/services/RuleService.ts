// R2Bucket type is provided globally by Cloudflare Workers types
import { ORPCError } from "@orpc/server";
import type { $Enums, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { OrganizationRepository, RuleRepository, type RuleWithRelations } from "../repositories";
import type { CloudflareEnv } from "../types/env";
import { createLogger } from "../utils/logger";

export class RuleService {
	private ruleRepository: RuleRepository;
	private organizationRepository: OrganizationRepository;
	private logger;

	constructor(
		private db: PrismaClient,
		private r2: R2Bucket,
		env: CloudflareEnv,
	) {
		this.ruleRepository = new RuleRepository(db);
		this.organizationRepository = new OrganizationRepository(db);
		this.logger = createLogger(env);
	}

	/**
	 * ルールを作成
	 */
	async createRule(
		userId: string,
		data: {
			name: string;
			type?: $Enums.RuleType;
			description?: string;
			content: string;
			visibility: "public" | "private" | "team";
			tags?: string[];
			organizationId?: string;
		},
	) {
		// ユーザーの存在確認
		this.logger.debug("Creating rule for userId", { userId });
		const user = await this.db.user.findUnique({
			where: { id: userId },
		});
		this.logger.debug("User found", { user });

		if (!user) {
			console.error("User not found:", userId);
			// デバッグ用：すべてのユーザーを確認
			const allUsers = await this.db.user.findMany({
				select: { id: true, email: true },
			});
			console.error("All users in DB:", allUsers);
			throw new ORPCError("NOT_FOUND", {
				message: "ユーザーが見つかりません",
			});
		}

		// 組織チェック
		if (data.organizationId) {
			const isMember = await this.organizationRepository.isMember(data.organizationId, userId);
			if (!isMember) {
				throw new ORPCError("FORBIDDEN", {
					message: "この組織にルールを作成する権限がありません",
				});
			}
		}

		// 名前の重複チェック
		const existingRule = await this.ruleRepository.findByName(data.name, data.organizationId);
		if (existingRule) {
			throw new ORPCError("CONFLICT", {
				message: "このルール名は既に使用されています",
			});
		}

		// ルール作成（エラー時のクリーンアップを考慮）
		const ruleId = nanoid();
		const versionId = nanoid();
		let rule: Awaited<ReturnType<typeof this.ruleRepository.create>> | undefined;
		let version: Awaited<ReturnType<typeof this.ruleRepository.createVersion>> | undefined;

		try {
			// バージョンIDを最初から設定してルールを作成
			rule = await this.ruleRepository.create({
				id: ruleId,
				name: data.name,
				type: data.type || "rule",
				userId,
				description: data.description || null,
				visibility: data.visibility,
				tags: data.tags ? JSON.stringify(data.tags) : null,
				publishedAt: null,
				views: 0,
				stars: 0,
				version: "1.0.0",
				latestVersionId: versionId, // 最初から設定
				organizationId: data.organizationId || null,
			});

			// 初期バージョンを作成
			version = await this.ruleRepository.createVersion({
				id: versionId,
				ruleId,
				versionNumber: "1.0.0",
				contentHash: await this.hashContent(data.content),
				changelog: "Initial version",
				r2ObjectKey: `rules/${ruleId}/versions/1.0.0/content.md`,
				createdBy: userId,
			});

			// R2にコンテンツを保存
			await this.saveContentToR2(ruleId, version.versionNumber, data.content);
		} catch (error) {
			// エラーが発生した場合のクリーンアップ
			this.logger.error(
				"Failed to create rule, attempting cleanup",
				error instanceof Error ? error : new Error(String(error)),
			);

			// 作成されたレコードを削除
			if (version) {
				await this.ruleRepository.deleteVersion(versionId).catch(() => {
					// Ignore cleanup errors
				});
			}
			if (rule) {
				await this.ruleRepository.delete(ruleId).catch(() => {
					// Ignore cleanup errors
				});
			}

			// R2のコンテンツも削除
			await this.deleteRuleContents(ruleId).catch(() => {
				// Ignore cleanup errors
			});

			throw error;
		}

		return {
			rule,
			version,
			content: data.content,
		};
	}

	/**
	 * ルールを取得
	 */
	async getRule(nameOrId: string, owner?: string, userId?: string) {
		this.logger.debug("getRule called with", { nameOrId, owner, userId });
		let rule: RuleWithRelations | null = null;

		if (owner) {
			// オーナー（ユーザーまたは組織）スコープのルール
			this.logger.debug("Looking for owner", { owner });

			// まずユーザーとして検索
			const user = await this.db.user.findUnique({
				where: { username: owner },
				select: { id: true },
			});

			if (user) {
				this.logger.debug("Owner is a user", { user });
				// ユーザーのルールを検索
				rule = await this.ruleRepository.findByNameAndUserId(nameOrId, user.id);
			} else {
				// 組織として検索
				const org = await this.organizationRepository.findByName(owner);
				if (!org) {
					throw new ORPCError("NOT_FOUND", {
						message: `オーナー '${owner}' が見つかりません`,
					});
				}
				this.logger.debug("Owner is an organization", { org });
				rule = await this.ruleRepository.findByName(nameOrId, org.id);
			}
		} else {
			// IDまたは名前で検索
			this.logger.debug("Looking for rule by ID or name", { nameOrId });
			rule = await this.ruleRepository.findById(nameOrId, true);
			if (!rule) {
				rule = await this.ruleRepository.findByName(nameOrId);
			}
		}

		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールが見つかりません",
			});
		}

		// アクセス権限チェック
		await this.checkRuleAccess(rule, userId);

		// 最新バージョンを取得
		const latestVersion = await this.ruleRepository.getLatestVersion(rule.id);

		if (!latestVersion) {
			// バージョンが存在しない場合は、R2から利用可能なバージョンをスキャン
			this.logger.warn("No version found in database, scanning R2 for available versions", {
				ruleId: rule.id,
			});

			const availableVersions = await this.scanR2ForVersions(rule.id);

			if (availableVersions.length === 0) {
				throw new ORPCError("NOT_FOUND", {
					message: "ルールのコンテンツが見つかりません",
				});
			}

			// 最新バージョンを取得（セマンティックバージョンでソート）
			const latestVersionNumber = this.getLatestVersion(availableVersions);
			this.logger.info("Found latest version in R2", {
				ruleId: rule.id,
				version: latestVersionNumber,
			});

			// コンテンツを取得
			const content = await this.getContentFromR2(rule.id, latestVersionNumber);

			return {
				rule,
				version: {
					id: rule.latestVersionId || rule.id,
					versionNumber: latestVersionNumber,
					createdAt: rule.createdAt,
				},
				content,
			};
		}

		// コンテンツを取得
		const content = await this.getContentFromR2(rule.id, latestVersion.versionNumber);

		return {
			rule,
			version: latestVersion,
			content,
		};
	}

	/**
	 * ルールを更新
	 */
	async updateRule(
		ruleId: string,
		userId: string,
		data: {
			content?: string;
			description?: string;
			tags?: string[];
			changelog?: string;
		},
	) {
		const rule = await this.ruleRepository.findById(ruleId);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールが見つかりません",
			});
		}

		// 権限チェック
		if (rule.userId !== userId) {
			throw new ORPCError("FORBIDDEN", {
				message: "このルールを更新する権限がありません",
			});
		}

		// メタデータの更新
		if (data.description !== undefined || data.tags !== undefined) {
			await this.ruleRepository.update(ruleId, {
				description: data.description,
				tags: data.tags ? JSON.stringify(data.tags) : undefined,
			});
		}

		// コンテンツの更新（新しいバージョンを作成）
		if (data.content) {
			const latestVersion = await this.ruleRepository.getLatestVersion(ruleId);
			const currentVersionNumber = latestVersion?.versionNumber || "0.0.0";
			const newVersionNumber = this.incrementVersion(currentVersionNumber);

			const version = await this.ruleRepository.createVersion({
				id: nanoid(),
				ruleId, // 直接ID指定
				versionNumber: newVersionNumber,
				contentHash: await this.hashContent(data.content),
				changelog: data.changelog || "Updated content",
				r2ObjectKey: `rules/${ruleId}/${newVersionNumber}`,
				createdBy: userId, // 直接ID指定
			});

			// R2にコンテンツを保存
			await this.saveContentToR2(ruleId, newVersionNumber, data.content);

			// ルールの最新バージョン情報を更新
			await this.ruleRepository.update(ruleId, {
				version: newVersionNumber,
				latestVersionId: version.id,
				updatedAt: this.getCurrentTimestamp(),
			});

			return {
				rule,
				version,
			};
		}

		return { rule };
	}

	/**
	 * ルールを公開
	 */
	async publishRule(ruleId: string, userId: string) {
		const rule = await this.ruleRepository.findById(ruleId);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールが見つかりません",
			});
		}

		if (rule.userId !== userId) {
			throw new ORPCError("FORBIDDEN", {
				message: "このルールを公開する権限がありません",
			});
		}

		if (rule.visibility === "private") {
			throw new ORPCError("BAD_REQUEST", {
				message: "プライベートルールは公開できません",
			});
		}

		await this.ruleRepository.update(ruleId, {
			publishedAt: this.getCurrentTimestamp(),
		});

		return { message: "ルールが公開されました" };
	}

	/**
	 * ルールを削除
	 */
	async deleteRule(ruleId: string, userId: string) {
		const rule = await this.ruleRepository.findById(ruleId);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールが見つかりません",
			});
		}

		// 権限チェック（作成者または組織オーナー）
		const canDelete = await this.canDeleteRule(rule, userId);
		if (!canDelete) {
			throw new ORPCError("FORBIDDEN", {
				message: "このルールを削除する権限がありません",
			});
		}

		// R2からコンテンツを削除
		await this.deleteRuleContents(ruleId);

		// データベースから削除
		await this.ruleRepository.delete(ruleId);

		return { message: "ルールが削除されました" };
	}

	/**
	 * ルールをプル（ダウンロード）
	 */
	async pullRule(ruleId: string, userId?: string) {
		const rule = await this.ruleRepository.findById(ruleId, true);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールが見つかりません",
			});
		}

		// アクセス権限チェック
		await this.checkRuleAccess(rule, userId);

		// ビュー数をインクリメント
		await this.ruleRepository.incrementViewCount(ruleId);

		// 最新バージョンのコンテンツを取得
		const latestVersion = await this.ruleRepository.getLatestVersion(ruleId);
		if (!latestVersion) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールのバージョンが見つかりません",
			});
		}

		const content = await this.getContentFromR2(ruleId, latestVersion.versionNumber);

		return {
			name: rule.name,
			description: rule.description,
			content,
			version: latestVersion.versionNumber,
			tags: rule.tags ? JSON.parse(rule.tags) : [],
			organization: rule.organization?.name,
			creator: rule.user?.username,
		};
	}

	/**
	 * 公開ルールを検索
	 */
	async searchPublicRules(params: { query?: string; page?: number; pageSize?: number }) {
		return await this.ruleRepository.findPublicRules(params.page, params.pageSize, params.query);
	}

	/**
	 * ユーザーのルールを取得
	 */
	async getUserRules(userId: string, page?: number, pageSize?: number) {
		return await this.ruleRepository.findByCreatorId(userId, page, pageSize);
	}

	/**
	 * ルールを ID で取得
	 */
	async getRuleById(ruleId: string, userId?: string) {
		const rule = await this.ruleRepository.findById(ruleId, true);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "Rule not found",
			});
		}

		await this.checkRuleAccess(rule, userId);
		return rule;
	}

	/**
	 * ルールのコンテンツを取得
	 */
	async getRuleContent(ruleId: string, version?: string, userId?: string) {
		const rule = await this.ruleRepository.findById(ruleId);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "Rule not found",
			});
		}

		await this.checkRuleAccess(rule, userId);

		let versionToUse = version;

		// バージョンが指定されていない場合は最新バージョンを取得
		if (!versionToUse) {
			const latestVersion = await this.ruleRepository.getLatestVersion(ruleId);
			if (!latestVersion) {
				throw new ORPCError("NOT_FOUND", {
					message: "No version found for this rule",
				});
			}
			versionToUse = latestVersion.versionNumber;
		}

		const content = await this.getContentFromR2(ruleId, versionToUse);

		return {
			id: ruleId,
			name: rule.name,
			version: versionToUse,
			content,
		};
	}

	/**
	 * ルールのバージョン一覧を取得
	 */
	async getRuleVersions(ruleId: string, userId?: string) {
		const rule = await this.ruleRepository.findById(ruleId);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "Rule not found",
			});
		}

		await this.checkRuleAccess(rule, userId);
		return this.ruleRepository.getVersions(ruleId);
	}

	/**
	 * ルールの特定バージョンを取得
	 */
	async getRuleVersion(ruleId: string, version: string, userId?: string) {
		const rule = await this.ruleRepository.findById(ruleId, true);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "Rule not found",
			});
		}

		await this.checkRuleAccess(rule, userId);
		const versionData = await this.ruleRepository.getVersion(ruleId, version);
		if (!versionData) {
			throw new ORPCError("NOT_FOUND", {
				message: "Version not found",
			});
		}

		const content = await this.getContentFromR2(ruleId, version);

		return {
			id: versionData.id,
			name: rule.name,
			description: rule.description,
			version: versionData.versionNumber,
			content,
			changelog: versionData.changelog,
			visibility: rule.visibility,
			tags: rule.tags ? JSON.parse(rule.tags) : [],
			author: rule.user,
			organization: rule.organization,
			createdAt: versionData.createdAt,
			createdBy: versionData.creator,
			isLatest: versionData.id === rule.latestVersionId,
		};
	}

	/**
	 * 関連ルールを取得
	 */
	async getRelatedRules(ruleId: string, limit: number, userId?: string) {
		// 元のルールを取得
		const rule = await this.ruleRepository.findById(ruleId);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "Rule not found",
			});
		}

		// タグをパース
		const tags = rule.tags
			? typeof rule.tags === "string"
				? JSON.parse(rule.tags)
				: rule.tags
			: [];

		// 関連ルールを検索（同じタグを持つ、または同じ作者のルール）
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic where clause building
		const where: any = {
			AND: [
				{ id: { not: ruleId } }, // 元のルールを除外
				{ publishedAt: { not: null } }, // 公開されているルールのみ
				{
					OR: [
						// 同じタグを持つルール
						...(tags.length > 0
							? tags.map((tag: string) => ({
									tags: { contains: `"${tag}"` },
								}))
							: []),
						// 同じ作者のルール
						{ userId: rule.userId },
					],
				},
			],
		};

		// プライベートルールは除外（認証済みユーザーでも他人のプライベートルールは見えない）
		if (!userId || userId !== rule.userId) {
			where.AND.push({ visibility: "public" });
		}

		const relatedRules = await this.db.rule.findMany({
			where,
			include: {
				user: {
					select: {
						id: true,
						username: true,
					},
				},
			},
			orderBy: [{ stars: "desc" }, { views: "desc" }, { updatedAt: "desc" }],
			take: limit,
		});

		return relatedRules.map((r) => ({
			id: r.id,
			name: r.name,
			description: r.description,
			author: r.user || { id: r.userId || "", username: "Unknown" },
			visibility: r.visibility as "public" | "private" | "organization",
			tags: r.tags ? (typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags) : [],
			version: r.version || "1.0.0",
			updated_at: r.updatedAt,
		}));
	}

	/**
	 * ルールの閲覧を記録
	 */
	async recordView(ruleId: string, userId?: string) {
		// ルールが存在するか確認
		const rule = await this.ruleRepository.findById(ruleId);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "Rule not found",
			});
		}

		// 閲覧記録を保存（認証済みユーザーのみ）
		if (userId) {
			// 既に閲覧済みかチェック
			const existingView = await this.db.ruleView.findFirst({
				where: {
					ruleId,
					userId,
				},
			});

			// 未閲覧の場合のみカウントアップ
			if (!existingView) {
				// 閲覧記録を追加
				await this.db.ruleView.create({
					data: {
						id: nanoid(),
						ruleId,
						userId,
						ipAddress: "0.0.0.0", // プライバシーのため実際のIPは記録しない
						userAgent: "Unknown",
						createdAt: this.getCurrentTimestamp(),
					},
				});

				// ビュー数を増やす
				await this.db.rule.update({
					where: { id: ruleId },
					data: { views: { increment: 1 } },
				});
			}
		}

		return { success: true, message: "View recorded" };
	}

	/**
	 * ルール一覧を取得
	 */
	async listRules(params: {
		visibility?: string;
		tags?: string[];
		author?: string;
		limit: number;
		offset: number;
		userId?: string;
	}) {
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic Prisma where clause construction requires flexible typing
		const where: any = {};

		// 可視性フィルタ
		if (params.visibility === "public") {
			where.visibility = "public";
		} else if (params.visibility === "private" && params.userId) {
			where.AND = [{ visibility: "private" }, { userId: params.userId }];
		} else if (params.visibility === "all" && params.userId) {
			// 認証済みユーザーは自分のルール＋公開ルールを見れる
			where.OR = [{ userId: params.userId }, { visibility: "public" }];
		} else {
			// デフォルトは公開ルールのみ
			where.visibility = "public";
		}

		// タグフィルタ
		if (params.tags && params.tags.length > 0) {
			where.AND = [
				...(where.AND || []),
				{
					OR: params.tags.map((tag) => ({
						tags: { contains: `"${tag}"` },
					})),
				},
			];
		}

		// 作者フィルタ
		if (params.author) {
			where.user = {
				username: params.author,
			};
		}

		// ルールを取得
		const [rules, total] = await Promise.all([
			this.db.rule.findMany({
				where,
				include: {
					user: {
						select: {
							id: true,
							username: true,
						},
					},
				},
				orderBy: { updatedAt: "desc" },
				skip: params.offset,
				take: params.limit,
			}),
			this.db.rule.count({ where }),
		]);

		// フォーマット
		const formattedRules = rules.map((rule) => ({
			id: rule.id,
			name: rule.name,
			description: rule.description,
			author: rule.user || { id: rule.userId || "", username: "Unknown" },
			visibility: rule.visibility,
			type: rule.type || "rule",
			tags: rule.tags ? (typeof rule.tags === "string" ? JSON.parse(rule.tags) : rule.tags) : [],
			version: rule.version || "1.0.0",
			updated_at: rule.updatedAt,
		}));

		return {
			rules: formattedRules,
			total,
			limit: params.limit,
			offset: params.offset,
		};
	}

	/**
	 * ルールを検索
	 */
	async searchRules(params: {
		query?: string;
		tags?: string[];
		author?: string;
		type?: $Enums.RuleType;
		visibility?: string;
		sortBy?: string;
		page: number;
		limit: number;
		userId?: string;
	}) {
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic Prisma where clause construction requires flexible typing
		const where: any = {};

		this.logger.debug("searchRules params:", params);

		// タイプフィルタ
		if (params.type) {
			where.type = params.type;
		}

		// 可視性フィルタ
		if (params.visibility) {
			where.visibility = params.visibility;
		} else if (!params.userId) {
			// 未認証ユーザーは公開ルールのみ
			where.visibility = "public";
		} else {
			// 認証済みユーザーは自分のルールまたは公開ルール
			where.OR = [{ userId: params.userId }, { visibility: "public" }];
		}

		// クエリ検索（名前と説明）
		if (params.query) {
			where.AND = [
				...(where.AND || []),
				{
					OR: [{ name: { contains: params.query } }, { description: { contains: params.query } }],
				},
			];
		}

		// タグフィルタ
		if (params.tags && params.tags.length > 0) {
			// タグはJSON文字列として保存されているので、各タグを含むかチェック
			where.AND = [
				...(where.AND || []),
				{
					OR: params.tags.map((tag) => ({
						tags: { contains: `"${tag}"` },
					})),
				},
			];
		}

		// 作者フィルタ
		if (params.author) {
			where.user = {
				username: params.author,
			};
		}

		// ソート設定
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic Prisma orderBy clause construction requires flexible typing
		const orderBy: any = {};
		switch (params.sortBy) {
			case "created":
				orderBy.createdAt = "desc";
				break;
			case "updated":
				orderBy.updatedAt = "desc";
				break;
			case "name":
				orderBy.name = "asc";
				break;
			case "views":
				orderBy.views = "desc";
				break;
			case "stars":
				orderBy.stars = "desc";
				break;
			default:
				orderBy.updatedAt = "desc";
		}

		// ページネーション計算
		const skip = (params.page - 1) * params.limit;

		this.logger.debug("searchRules where clause:", { where });
		this.logger.debug("searchRules skip and limit:", { skip, limit: params.limit });
		this.logger.debug("searchRules orderBy:", { orderBy });

		// ルールを検索
		const [rules, total] = await Promise.all([
			this.db.rule.findMany({
				where,
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
				orderBy,
				skip,
				take: params.limit,
			}),
			this.db.rule.count({ where }),
		]);

		this.logger.debug("searchRules found rules:", { count: rules.length, total });

		// フォーマット
		const formattedRules = rules.map((rule) => {
			const author = rule.user || { id: rule.userId || "", username: "Unknown", email: "" };
			return {
				id: rule.id,
				name: rule.name,
				userId: rule.userId,
				type: rule.type,
				visibility: rule.visibility,
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
				organization: rule.organization,
				author,
				updated_at: rule.updatedAt,
				created_at: rule.createdAt,
			};
		});

		return {
			rules: formattedRules,
			total,
			page: params.page,
			limit: params.limit,
		};
	}

	/**
	 * ルールへのアクセス権限をチェック
	 */
	// biome-ignore lint/suspicious/noExplicitAny: Rule type is complex Prisma model with relations, using any for flexibility
	private async checkRuleAccess(rule: any, userId?: string) {
		// パブリックルールは誰でもアクセス可能（publishedAtに関係なく）
		if (rule.visibility === "public") {
			return;
		}

		// 未認証ユーザーはここで拒否（プライベートまたはチームルール）
		if (!userId) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "このルールにアクセスするには認証が必要です",
			});
		}

		// 作成者は常にアクセス可能
		if (rule.userId === userId) {
			return;
		}

		// プライベートルールは作成者のみ
		if (rule.visibility === "private") {
			throw new ORPCError("FORBIDDEN", {
				message: "このルールにアクセスする権限がありません",
			});
		}

		// チームルールは組織メンバーのみ
		if (rule.visibility === "team" && rule.organizationId) {
			const isMember = await this.organizationRepository.isMember(rule.organizationId, userId);
			if (!isMember) {
				throw new ORPCError("FORBIDDEN", {
					message: "このルールにアクセスする権限がありません",
				});
			}
		}
	}

	/**
	 * ルール削除権限をチェック
	 */
	// biome-ignore lint/suspicious/noExplicitAny: Rule type is complex Prisma model with relations, using any for flexibility
	private async canDeleteRule(rule: any, userId: string): Promise<boolean> {
		// 作成者は削除可能
		if (rule.userId === userId) {
			return true;
		}

		// 組織オーナーも削除可能
		if (rule.organizationId) {
			return await this.organizationRepository.isOwner(rule.organizationId, userId);
		}

		return false;
	}

	/**
	 * コンテンツのハッシュを生成
	 */
	private async hashContent(content: string): Promise<string> {
		const encoder = new TextEncoder();
		const data = encoder.encode(content);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	}

	/**
	 * R2にコンテンツを保存
	 */
	private async saveContentToR2(ruleId: string, version: string, content: string) {
		const key = `rules/${ruleId}/versions/${version}/content.md`;
		await this.r2.put(key, content);
	}

	/**
	 * R2から利用可能なバージョンをスキャン
	 */
	private async scanR2ForVersions(ruleId: string): Promise<string[]> {
		const versions: string[] = [];
		const prefix = `rules/${ruleId}/versions/`;

		try {
			// R2のリスト機能を使用してバージョンフォルダをスキャン
			const listed = await this.r2.list({ prefix, delimiter: "/" });

			for (const item of listed.objects) {
				// パスから"versions/"以降、"/content.md"より前の部分を抽出
				const match = item.key.match(/versions\/([^/]+)\//);
				if (match?.[1]) {
					versions.push(match[1]);
				}
			}

			// 共通プレフィックスからもバージョンを抽出
			if (listed.delimitedPrefixes) {
				for (const prefix of listed.delimitedPrefixes) {
					const match = prefix.match(/versions\/([^/]+)\/$/);
					if (match?.[1]) {
						versions.push(match[1]);
					}
				}
			}
		} catch (error) {
			this.logger.error(
				`Failed to scan R2 for versions: ruleId=${ruleId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}

		return [...new Set(versions)]; // 重複を除去
	}

	/**
	 * バージョンリストから最新バージョンを取得
	 */
	private getLatestVersion(versions: string[]): string {
		if (versions.length === 0) {
			return "1.0.0";
		}

		// セマンティックバージョニングでソート
		const sorted = versions.sort((a, b) => {
			const aParts = a.split(".").map((p) => Number.parseInt(p) || 0);
			const bParts = b.split(".").map((p) => Number.parseInt(p) || 0);

			for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
				const aPart = aParts[i] || 0;
				const bPart = bParts[i] || 0;

				if (aPart > bPart) {
					return -1;
				}
				if (aPart < bPart) {
					return 1;
				}
			}

			return 0;
		});

		return sorted[0] || "";
	}

	/**
	 * R2からコンテンツを取得
	 */
	private async getContentFromR2(ruleId: string, version: string): Promise<string> {
		// バージョンが指定されている場合は通常のパス
		if (version) {
			const key = `rules/${ruleId}/versions/${version}/content.md`;
			const object = await this.r2.get(key);
			if (object) {
				return await object.text();
			}
		}

		// バージョンが空または見つからない場合は、いくつかのパスパターンを試す
		const fallbackPaths = [
			`rules/${ruleId}/content.md`,
			`rules/${ruleId}/versions/1.0.0/content.md`,
			`rules/${ruleId}/latest/content.md`,
		];

		for (const path of fallbackPaths) {
			const object = await this.r2.get(path);
			if (object) {
				this.logger.info("Found content at fallback path", { ruleId, path });
				return await object.text();
			}
		}

		throw new ORPCError("NOT_FOUND", {
			message: "ルールのコンテンツが見つかりません",
		});
	}

	/**
	 * R2からルールの全コンテンツを削除
	 */
	private async deleteRuleContents(ruleId: string) {
		const prefix = `rules/${ruleId}/`;
		const objects = await this.r2.list({ prefix });

		const deletePromises = objects.objects.map((obj) => this.r2.delete(obj.key));
		await Promise.all(deletePromises);
	}

	/**
	 * 現在のタイムスタンプを取得（Unix秒）
	 */
	private getCurrentTimestamp(): number {
		return Math.floor(Date.now() / 1000);
	}

	/**
	 * バージョン番号をインクリメント
	 */
	private incrementVersion(version: string): string {
		const parts = version.split(".");
		const patch = Number.parseInt(parts[2] || "0", 10) + 1;
		return `${parts[0]}.${parts[1]}.${patch}`;
	}
}
