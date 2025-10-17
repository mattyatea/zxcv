import { ORPCError } from "@orpc/server";
import type { PrismaClient } from "@prisma/client";

export abstract class BaseRepository {
	protected db: PrismaClient;

	constructor(db: PrismaClient) {
		this.db = db;
	}

	/**
	 * 共通のエラーハンドリング
	 */
	protected handleError(error: unknown, defaultMessage: string): never {
		console.error("Database error:", error);

		if (error instanceof ORPCError) {
			throw error;
		}

		// Prismaのエラー処理
		if (this.isPrismaError(error)) {
			const prismaError = error as {
				code: string;
				meta?: { target?: string[] };
			};
			if (prismaError.code === "P2002") {
				throw new ORPCError("CONFLICT", {
					message: "一意制約違反が発生しました",
				});
			}
			if (prismaError.code === "P2025") {
				throw new ORPCError("NOT_FOUND", {
					message: "指定されたリソースが見つかりません",
				});
			}
		}

		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: defaultMessage,
		});
	}

	/**
	 * Prismaエラーかどうかをチェック
	 */
	protected isPrismaError(error: unknown): boolean {
		return (
			error !== null &&
			typeof error === "object" &&
			"code" in error &&
			typeof (error as { code: string }).code === "string" &&
			(error as { code: string }).code.startsWith("P")
		);
	}

	/**
	 * 重複エラーかどうかをチェック
	 */
	protected isDuplicateError(error: unknown): boolean {
		return (
			this.isPrismaError(error) && (error as { code: string }).code === "P2002"
		);
	}

	/**
	 * ページネーション用のヘルパー
	 */
	protected getPaginationParams(page = 1, pageSize = 10) {
		const skip = (page - 1) * pageSize;
		return {
			skip,
			take: pageSize,
		};
	}

	/**
	 * 現在のタイムスタンプを取得（Unix秒）
	 */
	protected getCurrentTimestamp(): number {
		return Math.floor(Date.now() / 1000);
	}
}
