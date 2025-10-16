import type { PrismaClient, User } from "@prisma/client";
import type { UserStats } from "./packing/UserPackingService";

/**
 * ユーザー統計情報取得オプション
 */
export interface UserStatsOptions {
	/** 公開ルールのみカウントするか */
	publicOnly?: boolean;
	/** 合計スター数を含めるか */
	includeTotalStars?: boolean;
}

/**
 * ユーザー関連のデータ取得サービス
 * データベースアクセスを伴う操作を提供
 */
export class UserService {
	constructor(private db: PrismaClient) {}

	/**
	 * ユーザーの統計情報を取得
	 */
	async getUserStats(userId: string, options: UserStatsOptions = {}): Promise<UserStats> {
		try {
			const { publicOnly = false, includeTotalStars = false } = options;

			const [rulesCount, organizationsCount, totalStars] = await Promise.all([
				this.db.rule.count({
					where: {
						userId,
						...(publicOnly && { visibility: "public" }),
					},
				}),
				this.db.organizationMember.count({
					where: { userId },
				}),
				includeTotalStars
					? this.db.ruleStar.count({
							where: {
								rule: {
									userId,
									...(publicOnly && { visibility: "public" }),
								},
							},
						})
					: Promise.resolve(0),
			]);

			const stats: UserStats = {
				rulesCount: typeof rulesCount === "number" ? rulesCount : 0,
				organizationsCount: typeof organizationsCount === "number" ? organizationsCount : 0,
			};

			if (includeTotalStars) {
				stats.totalStars = typeof totalStars === "number" ? totalStars : 0;
			}

			return stats;
		} catch (error) {
			// エラーが発生した場合はデフォルト値を返す
			console.error("Error getting user stats:", error);
			return {
				rulesCount: 0,
				organizationsCount: 0,
				...(options.includeTotalStars && { totalStars: 0 }),
			};
		}
	}

	/**
	 * ユーザーをIDで取得
	 */
	async getUserById(userId: string): Promise<User | null> {
		return await this.db.user.findUnique({
			where: { id: userId },
		});
	}

	/**
	 * ユーザーをユーザー名で取得
	 */
	async getUserByUsername(username: string): Promise<User | null> {
		return await this.db.user.findUnique({
			where: { username: username.toLowerCase() },
		});
	}

	/**
	 * ユーザー名で検索
	 */
	async searchUsersByUsername(username: string, limit = 10): Promise<User[]> {
		return await this.db.user.findMany({
			where: {
				username: {
					contains: username.toLowerCase(),
				},
			},
			take: limit,
			orderBy: {
				username: "asc",
			},
		});
	}
}
