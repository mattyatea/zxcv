import { ORPCError } from "@orpc/server";
import * as z from "zod";
import { os } from "~/server/orpc";
import { dbWithAuth, dbWithOptionalAuth } from "~/server/orpc/middleware/combined";
import { OrganizationService } from "~/server/services/OrganizationService";

export const organizationsProcedures = {
	/**
	 * 組織を作成
	 */
	create: os
		.use(dbWithAuth)
		.input(
			z.object({
				name: z
					.string()
					.min(3)
					.max(30)
					.regex(/^[a-z0-9-]+$/),
				displayName: z.string().min(1).max(100),
				description: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			return await organizationService.createOrganization(user.id, input);
		}),

	/**
	 * 組織情報を取得
	 */
	get: os
		.use(dbWithOptionalAuth)
		.input(
			z.object({
				nameOrId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			return await organizationService.getOrganization(input.nameOrId, user?.id);
		}),

	/**
	 * 組織を更新
	 */
	update: os
		.use(dbWithAuth)
		.input(
			z.object({
				orgId: z.string(),
				displayName: z.string().min(1).max(100).optional(),
				description: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			const { orgId, ...updateData } = input;
			return await organizationService.updateOrganization(orgId, user.id, updateData);
		}),

	/**
	 * 組織を削除
	 */
	delete: os
		.use(dbWithAuth)
		.input(
			z.object({
				orgId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			return await organizationService.deleteOrganization(input.orgId, user.id);
		}),

	/**
	 * メンバーを招待
	 */
	inviteMember: os
		.use(dbWithAuth)
		.input(
			z.object({
				orgId: z.string(),
				email: z.string().email(),
				locale: z.enum(["ja", "en"]).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			return await organizationService.inviteMember(
				input.orgId,
				user.id,
				input.email,
				input.locale || "ja",
			);
		}),

	/**
	 * 招待を受け入れる
	 */
	acceptInvite: os
		.use(dbWithAuth)
		.input(
			z.object({
				token: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			return await organizationService.acceptInvitation(input.token, user.id);
		}),

	/**
	 * メンバーを削除
	 */
	removeMember: os
		.use(dbWithAuth)
		.input(
			z.object({
				orgId: z.string(),
				memberId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			return await organizationService.removeMember(input.orgId, user.id, input.memberId);
		}),

	/**
	 * メンバーの役割を更新
	 */
	updateMemberRole: os
		.use(dbWithAuth)
		.input(
			z.object({
				orgId: z.string(),
				memberId: z.string(),
				role: z.enum(["owner", "member"]),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			return await organizationService.updateMemberRole(
				input.orgId,
				user.id,
				input.memberId,
				input.role,
			);
		}),

	/**
	 * ユーザーが所属する組織を取得
	 */
	list: os.use(dbWithAuth).handler(async ({ context }) => {
		const { db, user, env } = context;
		const organizationService = new OrganizationService(db, env);

		const organizations = await organizationService.getUserOrganizations(user.id);

		return { organizations };
	}),

	/**
	 * 組織のメンバーを取得
	 */
	listMembers: os
		.use(dbWithAuth)
		.input(
			z.object({
				orgId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// メンバーかどうかチェック
			const isMember = await db.organizationMember.findFirst({
				where: {
					organizationId: input.orgId,
					userId: user.id,
				},
			});

			if (!isMember) {
				throw new ORPCError("FORBIDDEN", {
					message: "組織のメンバーのみ閲覧可能です",
				});
			}

			// メンバー一覧を取得
			const members = await db.organizationMember.findMany({
				where: { organizationId: input.orgId },
				include: {
					user: {
						select: {
							id: true,
							username: true,
							email: true,
						},
					},
				},
				orderBy: [
					{ role: "asc" }, // オーナーが先
					{ joinedAt: "asc" },
				],
			});

			return {
				members: members.map((m) => ({
					id: m.user.id,
					username: m.user.username,
					email: m.user.email,
					role: m.role,
					joinedAt: m.joinedAt,
				})),
			};
		}),

	/**
	 * 組織のルールを取得
	 */
	listRules: os
		.use(dbWithAuth)
		.input(
			z.object({
				orgId: z.string(),
				page: z.number().int().positive().default(1),
				pageSize: z.number().int().min(1).max(100).default(10),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// メンバーかどうかチェック
			const isMember = await db.organizationMember.findFirst({
				where: {
					organizationId: input.orgId,
					userId: user.id,
				},
			});

			if (!isMember) {
				throw new ORPCError("FORBIDDEN", {
					message: "組織のメンバーのみ閲覧可能です",
				});
			}

			// ページネーション計算
			const skip = (input.page - 1) * input.pageSize;

			// ルール一覧を取得
			const [rules, total] = await Promise.all([
				db.rule.findMany({
					where: { organizationId: input.orgId },
					include: {
						user: {
							select: {
								id: true,
								username: true,
							},
						},
					},
					orderBy: { updatedAt: "desc" },
					skip,
					take: input.pageSize,
				}),
				db.rule.count({
					where: { organizationId: input.orgId },
				}),
			]);

			return {
				rules: rules.map((r) => ({
					id: r.id,
					name: r.name,
					description: r.description,
					visibility: r.visibility,
					isPublished: r.publishedAt !== null,
					downloadCount: r.downloads,
					starCount: r.stars,
					createdAt: r.createdAt,
					updatedAt: r.updatedAt,
					user: r.user,
					latestVersion: r.version || "1.0.0",
				})),
				total,
				page: input.page,
				pageSize: input.pageSize,
				totalPages: Math.ceil(total / input.pageSize),
			};
		}),
};