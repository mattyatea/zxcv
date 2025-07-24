import { ORPCError } from "@orpc/server";
import * as z from "zod";
import { os } from "~/server/orpc";
import {
	dbWithAuth,
	dbWithEmailVerification,
	dbWithOptionalAuth,
} from "~/server/orpc/middleware/combined";
import { RuleService } from "~/server/services/RuleService";
import { parseRulePath } from "~/server/utils/namespace";

export const rulesProcedures = {
	/**
	 * パスによるルール取得
	 */
	getByPath: os
		.use(dbWithOptionalAuth)
		.input(
			z.object({
				path: z.string(), // Format: @owner/rulename or rulename
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			// パスをパース
			const parsed = parseRulePath(input.path);

			if (!parsed) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Invalid rule path format. Expected @owner/rulename or rulename",
				});
			}

			const { owner, ruleName } = parsed;

			return await ruleService.getRule(ruleName, owner, user?.id);
		}),

	/**
	 * ルール作成
	 */
	create: os
		.use(dbWithEmailVerification)
		.input(
			z.object({
				name: z
					.string()
					.min(1)
					.max(100)
					.regex(/^[a-zA-Z0-9_-]+$/),
				description: z.string().optional(),
				content: z.string(),
				visibility: z.enum(["public", "private", "organization"]),
				tags: z.array(z.string()).optional(),
				organizationId: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			const result = await ruleService.createRule(user.id, input);
			return result.rule;
		}),

	/**
	 * ルール更新
	 */
	update: os
		.use(dbWithAuth)
		.input(
			z.object({
				ruleId: z.string(),
				content: z.string().optional(),
				description: z.string().optional(),
				tags: z.array(z.string()).optional(),
				changelog: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			const { ruleId, ...updateData } = input;
			return await ruleService.updateRule(ruleId, user.id, updateData);
		}),

	/**
	 * ルール公開
	 */
	publish: os
		.use(dbWithAuth)
		.input(
			z.object({
				ruleId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.publishRule(input.ruleId, user.id);
		}),

	/**
	 * ルール削除
	 */
	delete: os
		.use(dbWithAuth)
		.input(
			z.object({
				ruleId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.deleteRule(input.ruleId, user.id);
		}),

	/**
	 * ルールをプル（ダウンロード）
	 */
	pull: os
		.use(dbWithOptionalAuth)
		.input(
			z.object({
				path: z.string(), // Format: @owner/rulename or rulename
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			// パスをパース
			const parsed = parseRulePath(input.path);
			if (!parsed) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Invalid rule path format",
				});
			}

			const { owner, ruleName } = parsed;

			// ルールを取得
			const rule = await ruleService.getRule(ruleName, owner, user?.id);

			// プル処理
			return await ruleService.pullRule(rule.rule.id, user?.id);
		}),

	/**
	 * ルール一覧
	 */
	list: os
		.use(dbWithOptionalAuth)
		.input(
			z.object({
				page: z.number().int().positive().default(1),
				pageSize: z.number().int().min(1).max(100).default(10),
				visibility: z.enum(["all", "public", "private", "organization"]).optional(),
				sortBy: z.enum(["updated", "created", "name", "stars"]).default("updated"),
				tags: z.array(z.string()).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.listRules({
				page: input.page,
				pageSize: input.pageSize,
				visibility: input.visibility,
				sortBy: input.sortBy,
				tags: input.tags,
				userId: user?.id,
			});
		}),

	/**
	 * ルール検索
	 */
	search: os
		.use(dbWithOptionalAuth)
		.input(
			z.object({
				query: z.string(),
				page: z.number().int().positive().default(1),
				pageSize: z.number().int().min(1).max(100).default(10),
				visibility: z.enum(["all", "public", "private", "organization"]).optional(),
				sortBy: z.enum(["updated", "created", "name", "stars"]).default("updated"),
				tags: z.array(z.string()).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.searchRules({
				query: input.query,
				page: input.page,
				pageSize: input.pageSize,
				visibility: input.visibility,
				sortBy: input.sortBy,
				tags: input.tags,
				userId: user?.id,
			});
		}),

	/**
	 * ユーザーのルール一覧
	 */
	listMyRules: os
		.use(dbWithAuth)
		.input(
			z.object({
				page: z.number().int().positive().default(1),
				pageSize: z.number().int().min(1).max(100).default(10),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.getUserRules(user.id, input.page, input.pageSize);
		}),

	/**
	 * ルールをスター
	 */
	star: os
		.use(dbWithAuth)
		.input(
			z.object({
				ruleId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.starRule(input.ruleId, user.id);
		}),

	/**
	 * ルールのスターを解除
	 */
	unstar: os
		.use(dbWithAuth)
		.input(
			z.object({
				ruleId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.unstarRule(input.ruleId, user.id);
		}),

	/**
	 * ルールのバージョン履歴を取得
	 */
	getVersionHistory: os
		.use(dbWithOptionalAuth)
		.input(
			z.object({
				ruleId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const ruleService = new RuleService(db, env.R2, env);

			return await ruleService.getVersionHistory(input.ruleId, user?.id);
		}),
};