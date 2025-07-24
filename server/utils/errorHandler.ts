import { ORPCError } from "@orpc/server";

/**
 * データベースエラーを統一的に処理
 */
export function handleDatabaseError(error: unknown, defaultMessage: string): never {
	console.error("Database error:", error);

	if (error instanceof ORPCError) {
		throw error;
	}

	// Prismaのエラー処理
	if (isPrismaError(error)) {
		const prismaError = error as { code: string; meta?: { target?: string[] } };

		// 一意制約違反
		if (prismaError.code === "P2002") {
			const field = prismaError.meta?.target?.[0];
			throw new ORPCError("CONFLICT", {
				message: field ? `${field}は既に使用されています` : "一意制約違反が発生しました",
			});
		}

		// レコードが見つからない
		if (prismaError.code === "P2025") {
			throw new ORPCError("NOT_FOUND", {
				message: "指定されたリソースが見つかりません",
			});
		}

		// 外部キー制約違反
		if (prismaError.code === "P2003") {
			throw new ORPCError("BAD_REQUEST", {
				message: "関連するリソースが存在しません",
			});
		}

		// 必須フィールドが不足
		if (prismaError.code === "P2012") {
			throw new ORPCError("BAD_REQUEST", {
				message: "必須フィールドが不足しています",
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
export function handleValidationError(field: string, message: string): never {
	throw new ORPCError("BAD_REQUEST", {
		message: `${field}: ${message}`,
		data: { code: "VALIDATION_ERROR", field, message },
	});
}

/**
 * 認証エラーを処理
 */
export function handleAuthError(message = "認証が必要です"): never {
	throw new ORPCError("UNAUTHORIZED", {
		message,
		data: { code: "AUTH_ERROR" },
	});
}

/**
 * 権限エラーを処理
 */
export function handlePermissionError(message = "権限がありません"): never {
	throw new ORPCError("FORBIDDEN", {
		message,
		data: { code: "PERMISSION_ERROR" },
	});
}

/**
 * リソースが見つからないエラーを処理
 */
export function handleNotFoundError(resource: string): never {
	throw new ORPCError("NOT_FOUND", {
		message: `${resource}が見つかりません`,
		data: { code: "NOT_FOUND" },
	});
}

/**
 * レート制限エラーを処理
 */
export function handleRateLimitError(retryAfter?: number): never {
	throw new ORPCError("TOO_MANY_REQUESTS", {
		message: "リクエストが多すぎます。しばらく待ってから再試行してください。",
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
		return {
			success: false,
			error: {
				code: error.code || "UNKNOWN_ERROR",
				message: error.message,
				details: error.data,
			},
		};
	}

	console.error("Unexpected error:", error);

	return {
		success: false,
		error: {
			code: "INTERNAL_SERVER_ERROR",
			message: "内部サーバーエラーが発生しました",
		},
	};
}
