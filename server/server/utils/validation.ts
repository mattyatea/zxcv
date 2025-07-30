import { z } from "zod";
import { handleValidationError } from "./errorHandler";

/**
 * メールアドレスのバリデーション
 */
export const emailSchema = z
	.string()
	.email("有効なメールアドレスを入力してください")
	.max(255, "メールアドレスは255文字以内で入力してください");

/**
 * パスワードのバリデーション
 */
export const passwordSchema = z
	.string()
	.min(8, "パスワードは8文字以上で入力してください")
	.max(100, "パスワードは100文字以内で入力してください")
	.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "パスワードは大文字、小文字、数字を含む必要があります");

/**
 * ユーザー名のバリデーション
 */
export const usernameSchema = z
	.string()
	.min(3, "ユーザー名は3文字以上で入力してください")
	.max(30, "ユーザー名は30文字以内で入力してください")
	.regex(/^[a-zA-Z0-9_-]+$/, "ユーザー名は英数字、ハイフン、アンダースコアのみ使用できます");

/**
 * 組織名のバリデーション
 */
export const organizationNameSchema = z
	.string()
	.min(3, "組織名は3文字以上で入力してください")
	.max(30, "組織名は30文字以内で入力してください")
	.regex(/^[a-z0-9-]+$/, "組織名は小文字英数字とハイフンのみ使用できます");

/**
 * ルール名のバリデーション
 */
export const ruleNameSchema = z
	.string()
	.min(1, "ルール名を入力してください")
	.max(100, "ルール名は100文字以内で入力してください")
	.regex(/^[a-zA-Z0-9_-]+$/, "ルール名は英数字、ハイフン、アンダースコアのみ使用できます");

/**
 * ページネーションのバリデーション
 */
export const paginationSchema = z.object({
	page: z.number().int().positive().default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
});

/**
 * IDのバリデーション（nanoid形式）
 */
export const idSchema = z
	.string()
	.regex(/^[a-zA-Z0-9_-]+$/, "無効なIDフォーマットです")
	.min(21, "無効なIDフォーマットです")
	.max(21, "無効なIDフォーマットです");

/**
 * タグのバリデーション
 */
export const tagsSchema = z
	.array(z.string().max(30, "タグは30文字以内で入力してください"))
	.max(10, "タグは10個まで設定できます")
	.optional();

/**
 * ロケールのバリデーション
 */
export const localeSchema = z.enum(["ja", "en"]).default("ja");

/**
 * 可視性のバリデーション
 */
export const visibilitySchema = z.enum(["public", "private", "team"]);

/**
 * バリデーションエラーをハンドリング
 */
export function validateWithError<T>(schema: z.ZodType<T>, data: unknown, fieldName?: string): T {
	try {
		return schema.parse(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const firstError = error.issues[0];
			const field = fieldName || firstError.path.join(".");
			handleValidationError(field, firstError.message);
		}
		throw error;
	}
}

/**
 * 安全なバリデーション（エラーを投げない）
 */
export function validateSafe<T>(
	schema: z.ZodType<T>,
	data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
	const result = schema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, error: result.error };
}

/**
 * 複数フィールドのバリデーション
 */
export function validateFields<T extends Record<string, unknown>>(
	validations: { [K in keyof T]: z.ZodType<T[K]> },
	data: Record<string, unknown>,
): T {
	const result: Partial<T> = {};

	for (const [field, schema] of Object.entries(validations)) {
		result[field as keyof T] = validateWithError(
			schema as z.ZodType<T[keyof T]>,
			data[field],
			field,
		);
	}

	return result as T;
}
