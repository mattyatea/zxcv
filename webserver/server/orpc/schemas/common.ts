import * as z from "zod";

// 基本的なIDスキーマ
export const IdSchema = z.object({
	id: z.string().describe("Unique identifier"),
});

// ユーザー関連スキーマ
export const UserSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	username: z.string(),
	emailVerified: z.boolean(),
});

// 完全なユーザープロフィールスキーマ（自分のプロフィール用）
export const FullUserProfileSchema = z.object({
	id: z.string(),
	email: z.string(),
	username: z.string(),
	role: z.string(),
	emailVerified: z.boolean(),
	displayName: z.string().nullable(),
	bio: z.string().nullable(),
	location: z.string().nullable(),
	website: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	createdAt: z.number(),
	updatedAt: z.number(),
});

// 他人のユーザープロフィールスキーマ（メール・roleなし）
export const OtherUserProfileSchema = z.object({
	id: z.string(),
	username: z.string(),
	email: z.null(),
	role: z.null(),
	emailVerified: z.boolean(),
	displayName: z.string().nullable(),
	bio: z.string().nullable(),
	location: z.string().nullable(),
	website: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	createdAt: z.number(),
	updatedAt: z.number(),
});

// 統合型（後方互換性のため）
export const UserProfileSchema = FullUserProfileSchema;

// 統計情報付きユーザー情報スキーマ（自分用）
export const UserWithStatsSchema = z.object({
	id: z.string(),
	email: z.string(),
	username: z.string(),
	role: z.string(),
	emailVerified: z.boolean(),
	displayName: z.string().nullable(),
	bio: z.string().nullable(),
	location: z.string().nullable(),
	website: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	createdAt: z.number(),
	updatedAt: z.number(),
	stats: z.object({
		rulesCount: z.number(),
		organizationsCount: z.number(),
		totalStars: z.number().optional(),
	}),
});

export const AuthUserSchema = z.object({
	id: z.string(),
	email: z.string(),
	username: z.string(),
	role: z.string(),
	emailVerified: z.boolean(),
	displayName: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	bio: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	website: z.string().nullable().optional(),
});

// 組織関連スキーマ
export const OrganizationSchema = z.object({
	id: z.string(),
	name: z.string(),
	displayName: z.string(),
	description: z.string().nullable(),
	ownerId: z.string(),
	createdAt: z.number(),
	updatedAt: z.number(),
});

export const OrganizationMemberSchema = z.object({
	id: z.string(),
	username: z.string(),
	email: z.string(),
	role: z.enum(["owner", "member"]),
	joinedAt: z.number(),
});

// ルール関連スキーマ
export const RuleSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	content: z.string(),
	tags: z.array(z.string()),
	visibility: z.enum(["public", "private", "organization"]),
	type: z.enum(["rule", "ccsubagents", "config"]).default("rule"),
	subType: z.string().nullable(),
	publishedAt: z.number().nullable(),
	createdAt: z.number(),
	updatedAt: z.number(),
	owner: z.object({
		id: z.string(),
		username: z.string(),
		type: z.enum(["user", "organization"]),
	}),
});

export const RuleVersionSchema = z.object({
	version: z.string(),
	changelog: z.string(),
	created_at: z.number(),
	createdBy: z.object({
		id: z.string(),
		username: z.string(),
	}),
});

// レスポンス関連スキーマ
export const SuccessResponseSchema = z.object({
	success: z.boolean(),
	message: z.string().optional(),
});

export const PaginationSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
	z.object({
		items: z.array(itemSchema),
		total: z.number(),
		page: z.number(),
		limit: z.number(),
	});

// トークン関連スキーマ
export const TokensSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
});

// 共通バリデーションスキーマ
export const UsernameSchema = z
	.string()
	.min(1)
	.regex(/^[a-zA-Z0-9_-]+$/)
	.describe("Username (alphanumeric, underscores, and hyphens only)");

export const EmailSchema = z.string().email().describe("Email address");

export const PasswordSchema = z.string().min(8).describe("Password (minimum 8 characters)");

export const RuleNameSchema = z
	.string()
	.regex(/^[a-zA-Z0-9_-]+$/)
	.describe("Rule name (alphanumeric, underscores, and hyphens only)");

export const OrganizationNameSchema = z
	.string()
	.min(1)
	.max(50)
	.regex(/^[a-zA-Z0-9-]+$/)
	.describe("Organization name (alphanumeric and hyphens only)");
