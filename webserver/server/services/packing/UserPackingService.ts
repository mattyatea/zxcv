import type { User } from "@prisma/client";

/**
 * ユーザー情報のパッキングオプション
 */
export interface UserPackingOptions {
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
	bio?: string | null;
	location?: string | null;
	website?: string | null;
}

/**
 * ユーザープロフィールの基本情報（共通部分）
 */
interface BaseUserProfile {
	id: string;
	username: string;
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
 * 完全なユーザープロフィール情報（自分のプロフィール向け）
 * センシティブな情報（email, role）を含む
 */
export interface FullUserProfile extends BaseUserProfile {
	email: string;
	role: string;
}

/**
 * 他人のユーザープロフィール情報（メール・roleなし）
 * センシティブな情報を除外した公開用プロフィール
 */
export interface OtherUserProfile extends BaseUserProfile {
	// センシティブな情報は含まない（省略）
}

/**
 * ユーザープロフィール情報（統合型）
 */
export type UserProfile = FullUserProfile | OtherUserProfile;

/**
 * ユーザー統計情報
 */
export interface UserStats {
	rulesCount: number;
	organizationsCount: number;
	totalStars?: number;
}

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
	stats: UserStats;
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
 * ユーザー情報を統一的にパッキングするユーティリティ
 * データベースアクセスは行わず、与えられた値のみをフォーマットする
 */
export class UserPackingService {
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
			bio: user.bio,
			location: user.location,
			website: user.website,
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
	 * センシティブな情報を除外して返す
	 */
	packOtherUserProfile(user: User): OtherUserProfile {
		return {
			id: user.id,
			username: user.username,
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
	packUserWithStats(user: User, stats: UserStats): UserWithStats {
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
	 * 複数ユーザーの検索用情報を一括作成
	 */
	packSearchUsers(users: User[], currentUserId?: string): SearchUser[] {
		return users.map((user) => this.packSearchUser(user, currentUserId));
	}
}
