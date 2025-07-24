import { ORPCError } from "@orpc/server";
import * as z from "zod";
import { os } from "~/server/orpc";
import { dbProvider, dbWithAuth } from "~/server/orpc/middleware/combined";
import { AuthService } from "~/server/services/AuthService";

export const authProcedures = {
	/**
	 * ユーザー登録
	 */
	register: os
		.use(dbProvider)
		.input(
			z.object({
				username: z.string().min(3).max(30),
				email: z.string().email(),
				password: z.string().min(8),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, env } = context;
			const authService = new AuthService(db, env);

			const { user, token } = await authService.register(input);
			return { token, user };
		}),

	/**
	 * ログイン
	 */
	login: os
		.use(dbProvider)
		.input(
			z.object({
				email: z.string().email(),
				password: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, env } = context;
			const authService = new AuthService(db, env);

			const { user, token } = await authService.login(input.email, input.password);
			return { token, user };
		}),

	/**
	 * ログアウト
	 */
	logout: os
		.use(dbWithAuth)
		.handler(async ({ context }) => {
			// JWTトークンベースの認証なので、サーバー側での処理は不要
			// クライアント側でトークンを削除する
			return { success: true };
		}),

	/**
	 * メール確認トークンの送信
	 */
	sendVerificationEmail: os
		.use(dbWithAuth)
		.handler(async ({ context }) => {
			const { db, user, env } = context;
			const authService = new AuthService(db, env);

			await authService.sendVerificationEmail(user.id);
			return { success: true };
		}),

	/**
	 * メール確認
	 */
	verifyEmail: os
		.use(dbProvider)
		.input(
			z.object({
				token: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, env } = context;
			const authService = new AuthService(db, env);

			await authService.verifyEmail(input.token);
			return { success: true };
		}),

	/**
	 * パスワードリセットトークンの送信
	 */
	forgotPassword: os
		.use(dbProvider)
		.input(
			z.object({
				email: z.string().email(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, env } = context;
			const authService = new AuthService(db, env);

			await authService.sendPasswordResetEmail(input.email);
			return { success: true };
		}),

	/**
	 * パスワードリセット
	 */
	resetPassword: os
		.use(dbProvider)
		.input(
			z.object({
				token: z.string(),
				password: z.string().min(8),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, env } = context;
			const authService = new AuthService(db, env);

			await authService.resetPassword(input.token, input.password);
			return { success: true };
		}),
};