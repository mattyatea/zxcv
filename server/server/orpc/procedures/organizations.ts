import { ORPCError } from "@orpc/server";
import { os } from "~/server/orpc";
import { dbWithAuth, dbWithOptionalAuth } from "~/server/orpc/middleware/combined";
import { dbProvider } from "~/server/orpc/middleware/db";
import { OrganizationService } from "~/server/services/OrganizationService";

export const organizationsProcedures = {
	/**
	 * 組織を作成
	 */
	create: os.organizations.create.use(dbWithAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const organizationService = new OrganizationService(db, env);

		const org = await organizationService.createOrganization(user.id, {
			name: input.name,
			displayName: input.displayName || input.name,
			description: input.description,
		});
		return org;
	}),

	/**
	 * 組織情報を取得
	 */
	get: os.organizations.get.use(dbWithOptionalAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const organizationService = new OrganizationService(db, env);

		// The contract expects 'id' but we need to handle nameOrId
		const result = await organizationService.getOrganization(input.id, user?.id);

		// Get owner info
		const owner = await db.user.findUnique({
			where: { id: result.ownerId },
			select: { id: true, username: true, email: true },
		});

		// Get member count
		const memberCount = await db.organizationMember.count({
			where: { organizationId: result.id },
		});

		// Get rule count
		const ruleCount = await db.rule.count({
			where: { organizationId: result.id },
		});

		// Get current user's role if authenticated
		let role: "owner" | "member" = "member";
		if (user?.id) {
			const membership = await db.organizationMember.findFirst({
				where: { organizationId: result.id, userId: user.id },
			});
			if (membership) {
				role = membership.role as "owner" | "member";
			}
		}

		return {
			id: result.id,
			name: result.name,
			displayName: result.displayName || result.name,
			description: result.description,
			owner: owner || { id: "", username: "Unknown", email: "" },
			role,
			memberCount,
			ruleCount,
			createdAt: result.createdAt,
		};
	}),

	/**
	 * 組織を更新
	 */
	update: os.organizations.update.use(dbWithAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const organizationService = new OrganizationService(db, env);

		const { id, ...updateData } = input;
		const result = await organizationService.updateOrganization(id, user.id, updateData);
		return {
			success: true,
			message: "Organization updated successfully",
			organization: result,
		};
	}),

	/**
	 * 組織を削除
	 */
	delete: os.organizations.delete.use(dbWithAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const organizationService = new OrganizationService(db, env);

		const result = await organizationService.deleteOrganization(input.id, user.id);
		return { success: true, message: result.message || "Organization deleted successfully" };
	}),

	/**
	 * メンバーを招待
	 */
	inviteMember: os.organizations.inviteMember
		.use(dbWithAuth)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			const result = await organizationService.inviteMember(
				input.organizationId,
				user.id,
				input.email,
				input.locale || "ja",
			);
			return { success: true, message: result.message };
		}),

	/**
	 * 招待を受け入れる
	 */
	acceptInvitation: os.organizations.acceptInvitation
		.use(dbWithAuth)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			const result = await organizationService.acceptInvitation(input.token, user.id);
			return {
				success: true,
				message: "Invitation accepted successfully",
				organization: result,
			};
		}),

	/**
	 * メンバーを削除
	 */
	removeMember: os.organizations.removeMember
		.use(dbWithAuth)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			const result = await organizationService.removeMember(
				input.organizationId,
				user.id,
				input.userId,
			);
			return { success: true, message: result.message };
		}),

	/**
	 * メンバーの役割を更新
	 */
	updateMemberRole: os.organizations.updateMemberRole
		.use(dbWithAuth)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const organizationService = new OrganizationService(db, env);

			const result = await organizationService.updateMemberRole(
				input.orgId,
				user.id,
				input.memberId,
				input.role,
			);
			return { success: true, message: result.message };
		}),

	/**
	 * ユーザーが所属する組織を取得
	 */
	list: os.organizations.list.use(dbWithAuth).handler(async ({ context }) => {
		const { db, user, env } = context;
		const organizationService = new OrganizationService(db, env);

		return await organizationService.getUserOrganizations(user.id);
	}),

	/**
	 * 組織のメンバーを取得
	 */
	listMembers: os.organizations.listMembers.use(dbWithAuth).handler(async ({ input, context }) => {
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
				role: m.role as "owner" | "member",
				joinedAt: m.joinedAt,
			})),
		};
	}),

	/**
	 * 組織のルールを取得
	 */
	listRules: os.organizations.listRules.use(dbWithAuth).handler(async ({ input, context }) => {
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
				visibility: r.visibility as "public" | "private" | "team",
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

	/**
	 * 組織のメンバーサマリーを取得
	 */
	members: os.organizations.members.use(dbWithAuth).handler(async ({ input, context }) => {
		const { db, user } = context;

		// メンバーかどうかチェック
		const isMember = await db.organizationMember.findFirst({
			where: {
				organizationId: input.organizationId,
				userId: user.id,
			},
		});

		if (!isMember) {
			throw new ORPCError("FORBIDDEN", {
				message: "組織のメンバーのみ閲覧可能です",
			});
		}

		// メンバーサマリーを取得
		const members = await db.organizationMember.findMany({
			where: { organizationId: input.organizationId },
			include: {
				user: {
					select: {
						id: true,
						username: true,
						email: true,
					},
				},
			},
		});

		return members.map((m) => ({
			id: m.user.id,
			username: m.user.username,
			email: m.user.email,
			role: m.role as "owner" | "member",
			joinedAt: m.joinedAt,
		}));
	}),

	/**
	 * 組織のルールサマリーを取得
	 */
	rules: os.organizations.rules.use(dbWithAuth).handler(async ({ input, context }) => {
		const { db, user } = context;

		// メンバーかどうかチェック
		const isMember = await db.organizationMember.findFirst({
			where: {
				organizationId: input.organizationId,
				userId: user.id,
			},
		});

		if (!isMember) {
			throw new ORPCError("FORBIDDEN", {
				message: "組織のメンバーのみ閲覧可能です",
			});
		}

		// ルールサマリーを取得
		const rules = await db.rule.findMany({
			where: { organizationId: input.organizationId },
			select: {
				id: true,
				name: true,
				description: true,
				version: true,
				updatedAt: true,
				user: {
					select: {
						id: true,
						username: true,
					},
				},
			},
			orderBy: { updatedAt: "desc" },
		});

		return rules.map((r) => ({
			id: r.id,
			name: r.name,
			description: r.description,
			version: r.version || "1.0.0",
			updatedAt: r.updatedAt,
			author: r.user,
		}));
	}),

	/**
	 * 組織から離脱
	 */
	leave: os.organizations.leave.use(dbWithAuth).handler(async ({ input, context }) => {
		const { db, user, env } = context;
		const organizationService = new OrganizationService(db, env);

		return await organizationService.leaveOrganization(input.organizationId, user.id);
	}),

	/**
	 * Get public organization profile
	 */
	getPublicProfile: os.organizations.getPublicProfile
		.use(dbProvider)
		.handler(async ({ input, context }) => {
			const { name } = input;
			const { db } = context;

			// Get organization
			const organization = await db.organization.findUnique({
				where: { name: name.toLowerCase() },
				select: {
					id: true,
					name: true,
					displayName: true,
					description: true,
					createdAt: true,
				},
			});

			if (!organization) {
				throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
			}

			// Get public rules count and total stars
			const [publicRulesCount, totalStars] = await Promise.all([
				db.rule.count({
					where: {
						organizationId: organization.id,
						visibility: "public",
					},
				}),
				db.ruleStar.count({
					where: {
						rule: {
							organizationId: organization.id,
							visibility: "public",
						},
					},
				}),
			]);

			// Get public rules with star count
			const publicRules = await db.rule.findMany({
				where: {
					organizationId: organization.id,
					visibility: "public",
				},
				select: {
					id: true,
					name: true,
					description: true,
					createdAt: true,
					updatedAt: true,
					user: {
						select: {
							id: true,
							username: true,
						},
					},
					starredBy: {
						select: {
							id: true,
						},
					},
				},
				orderBy: {
					updatedAt: "desc",
				},
				take: 20,
			});

			return {
				organization: {
					id: organization.id,
					name: organization.name,
					displayName: organization.displayName,
					description: organization.description,
					createdAt: organization.createdAt,
				},
				stats: {
					publicRulesCount,
					totalStars,
				},
				publicRules: publicRules.map((rule: any) => ({
					id: rule.id,
					name: rule.name,
					description: rule.description || "",
					stars: rule.starredBy.length,
					createdAt: rule.createdAt,
					updatedAt: rule.updatedAt,
					user: rule.user,
				})),
			};
		}),
};
