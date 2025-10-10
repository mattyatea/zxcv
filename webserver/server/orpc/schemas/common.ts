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

export const UserProfileSchema = UserSchema.extend({
	displayName: z.string().nullable(),
	bio: z.string().nullable(),
	location: z.string().nullable(),
	website: z.string().url().nullable().or(z.literal("")),
	avatarUrl: z.string().nullable(),
	createdAt: z.number(),
	updatedAt: z.number(),
});

export const AuthUserSchema = UserSchema.pick({
	id: true,
	email: true,
	username: true,
	emailVerified: true,
}).extend({
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
	visibility: z.enum(["public", "private"]),
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
