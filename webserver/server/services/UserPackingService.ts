import type { PrismaClient, User } from "@prisma/client";

/**
 * ユーザー情報のパッキングオプション
 */
export interface UserPackingOptions {
	/** 統計情報を含めるか */
	includeStats?: boolean;
	/** 公開プロフィールのみか */
	publicOnly?: boolean;
	/** 現在のユーザーID（自分のプロフィールかどうかの判定に使用） */
	currentUserId?: string;
	/** メールアドレスを含めるか */
	includeEmail?: boolean;
}

/**
 * 認証用ユーザー情報
 */
export interface AuthUser {
	id: string;
	email: string;
	username: string;
	role: string;
	emailVerified: boolean;
	displayName: string | null;
	avatarUrl: string | null;
}

/**
 * 完全なユーザープロフィール情報（自分のプロフィール向け）
 */
export interface FullUserProfile {
	id: string;
	username: string;
	email: string;
	role: string;
	emailVerified: boolean;
	displayName: string | null;
	bio: string | null;
	location: string | null;
	website: string | null;
	avatarUrl: string | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * 他人のユーザープロフィール情報（メール・roleなし）
 */
export interface OtherUserProfile {
	id: string;
	username: string;
	email: null;
	role: null;
	emailVerified: boolean;
	displayName: string | null;
	bio: string | null;
	location: string | null;
	website: string | null;
	avatarUrl: string | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * ユーザープロフィール情報（統合型）
 */
export type UserProfile = FullUserProfile | OtherUserProfile;

/**
 * 統計情報付きユーザー情報（自分用）
 */
export interface UserWithStats {
	id: string;
	email: string;
	username: string;
	role: string;
	emailVerified: boolean;
	displayName: string | null;
	bio: string | null;
	location: string | null;
	website: string | null;
	avatarUrl: string | null;
	createdAt: number;
	updatedAt: number;
	stats: {
		rulesCount: number;
		organizationsCount: number;
		totalStars?: number;
	};
}

/**
 * 公開プロフィール情報
 */
export interface PublicUserProfile {
	id: string;
	username: string;
	displayName: string | null;
	bio: string | null;
	location: string | null;
	website: string | null;
	avatarUrl: string | null;
	createdAt: number;
}

/**
 * 検索用ユーザー情報
 */
export interface SearchUser {
	id: string;
	username: string;
	email: string | null;
}

/**
 * ユーザー情報を統一的にパッキングするサービス
 */
export class UserPackingService {
	constructor(private db: PrismaClient) {}

	/**
	 * 認証用ユーザー情報を作成
	 */
	packAuthUser(user: User): AuthUser {
		return {
			id: user.id,
			email: user.email,
			username: user.username,
			role: user.role,
			emailVerified: user.emailVerified,
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
		};
	}

	/**
	 * 完全なユーザープロフィール情報を作成（自分のプロフィール用）
	 */
	packFullUserProfile(user: User): FullUserProfile {
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role,
			emailVerified: user.emailVerified,
			displayName: user.displayName,
			bio: user.bio,
			location: user.location,
			website: user.website,
			avatarUrl: user.avatarUrl,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}

	/**
	 * 他人のユーザープロフィール情報を作成（メール・roleなし）
	 */
	packOtherUserProfile(user: User): OtherUserProfile {
		return {
			id: user.id,
			username: user.username,
			email: null,
			role: null,
			emailVerified: user.emailVerified,
			displayName: user.displayName,
			bio: user.bio,
			location: user.location,
			website: user.website,
			avatarUrl: user.avatarUrl,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}

	/**
	 * プロフィール用ユーザー情報を作成（自動判定）
	 */
	packUserProfile(user: User, options: UserPackingOptions = {}): UserProfile {
		const isOwnProfile = options.currentUserId === user.id;

		if (isOwnProfile || options.includeEmail) {
			return this.packFullUserProfile(user);
		}
		return this.packOtherUserProfile(user);
	}

	/**
	 * 統計情報付きユーザー情報を作成（自分用）
	 */
	async packUserWithStats(user: User, options: UserPackingOptions = {}): Promise<UserWithStats> {
		const stats = await this.getUserStats(user.id, options);

		return {
			id: user.id,
			email: user.email,
			username: user.username,
			role: user.role,
			emailVerified: user.emailVerified,
			displayName: user.displayName,
			bio: user.bio,
			location: user.location,
			website: user.website,
			avatarUrl: user.avatarUrl,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			stats,
		};
	}

	/**
	 * 公開プロフィール情報を作成
	 */
	packPublicProfile(user: User): PublicUserProfile {
		return {
			id: user.id,
			username: user.username,
			displayName: user.displayName,
			bio: user.bio,
			location: user.location,
			website: user.website,
			avatarUrl: user.avatarUrl,
			createdAt: user.createdAt,
		};
	}

	/**
	 * 検索用ユーザー情報を作成
	 */
	packSearchUser(user: User, currentUserId?: string): SearchUser {
		return {
			id: user.id,
			username: user.username,
			email: user.id === currentUserId ? user.email : null,
		};
	}

	/**
	 * ユーザー統計情報を取得
	 */
	async getUserStats(
		userId: string,
		options: UserPackingOptions = {},
	): Promise<{
		rulesCount: number;
		organizationsCount: number;
		totalStars?: number;
	}> {
		try {
			const [rulesCount, organizationsCount, totalStars] = await Promise.all([
				this.db.rule.count({
					where: {
						userId,
						...(options.publicOnly && { visibility: "public" }),
					},
				}),
				this.db.organizationMember.count({
					where: { userId },
				}),
				options.includeStats
					? this.db.ruleStar.count({
							where: {
								rule: {
									userId,
									...(options.publicOnly && { visibility: "public" }),
								},
							},
						})
					: Promise.resolve(0),
			]);

			const stats: {
				rulesCount: number;
				organizationsCount: number;
				totalStars?: number;
			} = {
				rulesCount: typeof rulesCount === "number" ? rulesCount : 0,
				organizationsCount: typeof organizationsCount === "number" ? organizationsCount : 0,
			};

			if (options.includeStats) {
				stats.totalStars = typeof totalStars === "number" ? totalStars : 0;
			}

			return stats;
		} catch (error) {
			// エラーが発生した場合はデフォルト値を返す
			console.error("Error getting user stats:", error);
			return {
				rulesCount: 0,
				organizationsCount: 0,
				...(options.includeStats && { totalStars: 0 }),
			};
		}
	}

	/**
	 * 複数ユーザーの検索用情報を一括作成
	 */
	packSearchUsers(users: User[], currentUserId?: string): SearchUser[] {
		return users.map((user) => this.packSearchUser(user, currentUserId));
	}
}
