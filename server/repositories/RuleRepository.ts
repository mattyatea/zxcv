import type { Prisma, Rule, RuleVersion } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

type RuleWithRelations = Rule & {
	user?: { username: string } | null;
	organization?: { name: string } | null;
	versions?: RuleVersion[] | null;
	creator?: { username: string } | null;
};

export class RuleRepository extends BaseRepository {
	/**
	 * ルールを作成
	 */
	async create(data: Prisma.RuleCreateInput): Promise<Rule> {
		try {
			return await this.db.rule.create({
				data: {
					...data,
					createdAt: this.getCurrentTimestamp(),
					updatedAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			this.handleError(error, "ルールの作成に失敗しました");
		}
	}

	/**
	 * ルールをIDで取得
	 */
	async findById(id: string, includeRelations = false): Promise<RuleWithRelations | null> {
		try {
			return await this.db.rule.findUnique({
				where: { id },
				include: includeRelations
					? {
							user: { select: { username: true } },
							organization: { select: { name: true } },
							/* versions: {
								orderBy: { versionNumber: "desc" },
								take: 1,
							}, */
						}
					: undefined,
			});
		} catch (error) {
			this.handleError(error, "ルールの取得に失敗しました");
		}
	}

	/**
	 * ルールを名前で検索
	 */
	async findByName(name: string, orgId?: string): Promise<RuleWithRelations | null> {
		try {
			// @ts-ignore - Prisma type incompatibility with nullable relations
			return await this.db.rule.findFirst({
				where: {
					name,
					...(orgId ? { organizationId: orgId } : {}),
				},
				include: {
					user: { select: { username: true } },
					organization: { select: { name: true } },
				},
			});
		} catch (error) {
			this.handleError(error, "ルールの検索に失敗しました");
		}
	}

	/**
	 * 公開ルールを一覧取得
	 */
	async findPublicRules(
		page = 1,
		pageSize = 10,
		searchQuery?: string,
	): Promise<{ rules: RuleWithRelations[]; total: number }> {
		try {
			const where: Prisma.RuleWhereInput = {
				publishedAt: { not: null },
				visibility: "public",
				...(searchQuery
					? {
							OR: [
								{ name: { contains: searchQuery } },
								{ description: { contains: searchQuery } },
								{ tags: { contains: searchQuery } },
							],
						}
					: {}),
			};

			const [rules, total] = await Promise.all([
				this.db.rule.findMany({
					where,
					include: {
						user: { select: { username: true } },
						organization: { select: { name: true } },
					},
					orderBy: { updatedAt: "desc" },
					...this.getPaginationParams(page, pageSize),
				}),
				this.db.rule.count({ where }),
			]);

			return { rules, total };
		} catch (error) {
			this.handleError(error, "公開ルールの取得に失敗しました");
		}
	}

	/**
	 * ユーザーのルールを取得
	 */
	async findByCreatorId(
		creatorId: string,
		page = 1,
		pageSize = 10,
	): Promise<{ rules: RuleWithRelations[]; total: number }> {
		try {
			const where: Prisma.RuleWhereInput = { userId: creatorId };

			const [rules, total] = await Promise.all([
				this.db.rule.findMany({
					where,
					include: {
						organization: { select: { name: true } },
						/* versions: {
							orderBy: { versionNumber: "desc" },
							take: 1,
						}, */
					},
					orderBy: { updatedAt: "desc" },
					...this.getPaginationParams(page, pageSize),
				}),
				this.db.rule.count({ where }),
			]);

			return { rules, total };
		} catch (error) {
			this.handleError(error, "ユーザーのルール取得に失敗しました");
		}
	}

	/**
	 * ルールを更新
	 */
	async update(id: string, data: Prisma.RuleUpdateInput): Promise<Rule> {
		try {
			return await this.db.rule.update({
				where: { id },
				data: {
					...data,
					updatedAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			this.handleError(error, "ルールの更新に失敗しました");
		}
	}

	/**
	 * ルールを削除
	 */
	async delete(id: string): Promise<void> {
		try {
			await this.transaction(async (tx) => {
				// 関連するバージョンも削除
				await tx.ruleVersion.deleteMany({
					where: { ruleId: id },
				});

				await tx.rule.delete({
					where: { id },
				});
			});
		} catch (error) {
			this.handleError(error, "ルールの削除に失敗しました");
		}
	}

	/**
	 * ルールのダウンロード数をインクリメント
	 */
	async incrementDownloadCount(id: string): Promise<void> {
		try {
			await this.db.rule.update({
				where: { id },
				data: {
					downloads: { increment: 1 },
					updatedAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			// ダウンロード数の更新失敗はクリティカルではないのでログのみ
			console.error("Failed to increment download count:", error);
		}
	}

	/**
	 * バージョンを作成
	 */
	async createVersion(data: Prisma.RuleVersionCreateInput): Promise<RuleVersion> {
		try {
			return await this.db.ruleVersion.create({
				data: {
					...data,
					createdAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			this.handleError(error, "バージョンの作成に失敗しました");
		}
	}

	/**
	 * 最新バージョンを取得
	 */
	async getLatestVersion(ruleId: string): Promise<RuleVersion | null> {
		try {
			return await this.db.ruleVersion.findFirst({
				where: { ruleId },
				orderBy: { versionNumber: "desc" },
			});
		} catch (error) {
			this.handleError(error, "最新バージョンの取得に失敗しました");
		}
	}
}
