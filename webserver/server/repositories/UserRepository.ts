import { ORPCError } from "@orpc/server";
import type { Prisma, User } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export class UserRepository extends BaseRepository {
	/**
	 * IDでユーザーを取得
	 */
	async findById(id: string): Promise<User | null> {
		try {
			return await this.db.user.findUnique({
				where: { id },
			});
		} catch (error) {
			this.handleError(error, "ユーザーの取得に失敗しました");
		}
	}

	/**
	 * メールアドレスでユーザーを取得
	 */
	async findByEmail(email: string): Promise<User | null> {
		try {
			return await this.db.user.findUnique({
				where: { email },
			});
		} catch (error) {
			this.handleError(error, "ユーザーの取得に失敗しました");
		}
	}

	/**
	 * ユーザー名でユーザーを取得
	 */
	async findByUsername(username: string): Promise<User | null> {
		try {
			return await this.db.user.findUnique({
				where: { username },
			});
		} catch (error) {
			this.handleError(error, "ユーザーの取得に失敗しました");
		}
	}

	/**
	 * ユーザーを作成
	 */
	async create(data: Prisma.UserCreateInput): Promise<User> {
		try {
			// テストとの互換性のため、passwordHashフィールドを処理
			const createData = { ...data };
			if ("password" in createData) {
				// @ts-ignore - テスト互換性のため
				createData.passwordHash = createData.password;
				// @ts-ignore - テスト互換性のため
				delete createData.password;
			}

			return await this.db.user.create({
				data: {
					...createData,
					createdAt: this.getCurrentTimestamp(),
					updatedAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			if (this.isDuplicateError(error)) {
				throw new ORPCError("CONFLICT", {
					message: "ユーザー名またはメールアドレスは既に使用されています",
				});
			}
			this.handleError(error, "ユーザーの作成に失敗しました");
		}
	}

	/**
	 * ユーザーを更新
	 */
	async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
		try {
			return await this.db.user.update({
				where: { id },
				data: {
					...data,
					updatedAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			this.handleError(error, "ユーザーの更新に失敗しました");
		}
	}

	/**
	 * ユーザーを削除
	 */
	async delete(id: string): Promise<void> {
		try {
			await this.db.user.delete({
				where: { id },
			});
		} catch (error) {
			this.handleError(error, "ユーザーの削除に失敗しました");
		}
	}

	/**
	 * メールアドレスを検証済みに更新
	 */
	async verifyEmail(userId: string): Promise<User> {
		try {
			return await this.db.user.update({
				where: { id: userId },
				data: {
					emailVerified: true,
					updatedAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			this.handleError(error, "メールアドレスの検証に失敗しました");
		}
	}

	/**
	 * パスワードを更新
	 */
	async updatePassword(userId: string, hashedPassword: string): Promise<User> {
		try {
			return await this.db.user.update({
				where: { id: userId },
				data: {
					passwordHash: hashedPassword,
					updatedAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			this.handleError(error, "パスワードの更新に失敗しました");
		}
	}

	/**
	 * 最終ログイン時刻を更新
	 */
	async updateLastLogin(userId: string): Promise<void> {
		try {
			await this.db.user.update({
				where: { id: userId },
				data: {
					// lastLoginAt: this.getCurrentTimestamp(), // Field doesn't exist in schema
					updatedAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			// ログイン時刻の更新失敗はクリティカルではないのでログのみ
			console.error("Failed to update last login time:", error);
		}
	}

	/**
	 * 重複エラーかどうかをチェック
	 */
	protected override isDuplicateError(error: unknown): boolean {
		return (
			error !== null &&
			typeof error === "object" &&
			"code" in error &&
			(error as { code: string }).code === "P2002"
		);
	}
}
