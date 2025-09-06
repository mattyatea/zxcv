import { ORPCError } from "@orpc/server";
import type { Locale } from "./locale";

/**
 * データベースエラーを統一的に処理
 */
export function handleDatabaseError(
	error: unknown,
	defaultMessage: string,
	locale: Locale = "ja",
): never {
	// 開発環境では詳細なエラー情報を出力
	if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
		console.error("=== Database Error Details ===");
		console.error("Error:", error);
		console.error("Default message:", defaultMessage);
		if (error instanceof Error) {
			console.error("Stack trace:", error.stack);
		}
		console.error("=============================");
	} else {
		console.error("Database error:", error);
	}

	if (error instanceof ORPCError) {
		throw error;
	}

	// Prismaのエラー処理
	if (isPrismaError(error)) {
		const prismaError = error as { code: string; meta?: { target?: string[] } };

		// 一意制約違反
		if (prismaError.code === "P2002") {
			const field = prismaError.meta?.target?.[0];
			const message =
				locale === "ja"
					? field
						? `${field}は既に使用されています`
						: "一意制約違反が発生しました"
					: field
						? `${field} is already in use`
						: "Unique constraint violation";
			throw new ORPCError("CONFLICT", {
				message,
			});
		}

		// レコードが見つからない
		if (prismaError.code === "P2025") {
			const message =
				locale === "ja"
					? "指定されたリソースが見つかりません"
					: "The specified resource was not found";
			throw new ORPCError("NOT_FOUND", {
				message,
			});
		}

		// 外部キー制約違反
		if (prismaError.code === "P2003") {
			const message =
				locale === "ja" ? "関連するリソースが存在しません" : "Related resource does not exist";
			throw new ORPCError("BAD_REQUEST", {
				message,
			});
		}

		// 必須フィールドが不足
		if (prismaError.code === "P2012") {
			const message =
				locale === "ja" ? "必須フィールドが不足しています" : "Required fields are missing";
			throw new ORPCError("BAD_REQUEST", {
				message,
			});
		}
	}

	// その他のエラー
	throw new ORPCError("INTERNAL_SERVER_ERROR", {
		message: defaultMessage,
	});
}

/**
 * Prismaエラーかどうかをチェック
 */
export function isPrismaError(error: unknown): boolean {
	return (
		error !== null &&
		typeof error === "object" &&
		"code" in error &&
		typeof (error as { code: string }).code === "string" &&
		(error as { code: string }).code.startsWith("P")
	);
}

/**
 * バリデーションエラーを処理
 */
export function handleValidationError(
	field: string,
	message: string,
	_locale: Locale = "ja",
): never {
	throw new ORPCError("BAD_REQUEST", {
		message: `${field}: ${message}`,
		data: { code: "VALIDATION_ERROR", field, message },
	});
}

/**
 * 認証エラーを処理
 */
export function handleAuthError(message?: string, locale: Locale = "ja"): never {
	const defaultMessage = locale === "ja" ? "認証が必要です" : "Authentication required";
	const errorMessage = message || defaultMessage;
	throw new ORPCError("UNAUTHORIZED", {
		message: errorMessage,
		data: { code: "AUTH_ERROR" },
	});
}

/**
 * 権限エラーを処理
 */
export function handlePermissionError(message?: string, locale: Locale = "ja"): never {
	const defaultMessage = locale === "ja" ? "権限がありません" : "Permission denied";
	const errorMessage = message || defaultMessage;
	throw new ORPCError("FORBIDDEN", {
		message: errorMessage,
		data: { code: "PERMISSION_ERROR" },
	});
}

/**
 * リソースが見つからないエラーを処理
 */
export function handleNotFoundError(resource: string, locale: Locale = "ja"): never {
	const message = locale === "ja" ? `${resource}が見つかりません` : `${resource} not found`;
	throw new ORPCError("NOT_FOUND", {
		message,
		data: { code: "NOT_FOUND" },
	});
}

/**
 * レート制限エラーを処理
 */
export function handleRateLimitError(retryAfter?: number, locale: Locale = "ja"): never {
	const message =
		locale === "ja"
			? "リクエストが多すぎます。しばらく待ってから再試行してください。"
			: "Too many requests. Please try again later.";
	throw new ORPCError("TOO_MANY_REQUESTS", {
		message,
		data: { code: "RATE_LIMIT_EXCEEDED", retryAfter },
	});
}

/**
 * エラーレスポンスの形式を統一
 */
export interface ErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
}

/**
 * エラーレスポンスを作成
 */
export function createErrorResponse(error: unknown): ErrorResponse {
	if (error instanceof ORPCError) {
		// 開発環境ではORPCError詳細も出力
		if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
			console.error("=== ORPCError Details ===");
			console.error("Code:", error.code);
			console.error("Message:", error.message);
			console.error("Data:", error.data);
			console.error("=========================");
		}

		return {
			success: false,
			error: {
				code: error.code || "UNKNOWN_ERROR",
				message: error.message,
				details: error.data,
			},
		};
	}

	// 開発環境では詳細なエラー情報を出力
	if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
		console.error("=== Unexpected Error Details ===");
		console.error("Error:", error);
		if (error instanceof Error) {
			console.error("Name:", error.name);
			console.error("Message:", error.message);
			console.error("Stack:", error.stack);
		}
		console.error("================================");
	} else {
		console.error("Unexpected error:", error);
	}

	return {
		success: false,
		error: {
			code: "INTERNAL_SERVER_ERROR",
			message: "Internal server error",
		},
	};
}
