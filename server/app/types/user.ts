export interface UserProfile {
	id: string;
	email: string;
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

export interface UserStats {
	rulesCount: number;
	organizationsCount: number;
}

export interface PublicUserStats {
	publicRulesCount: number;
	totalStars: number;
}