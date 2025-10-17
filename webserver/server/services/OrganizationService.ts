import { ORPCError } from "@orpc/server";
import type { Organization, OrganizationMember, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { OrganizationRepository, UserRepository } from "../repositories";
import type { CloudflareEnv } from "../types/env";
import { sendEmail } from "../utils/email";
import { generateToken, verifyToken } from "../utils/jwt";

export class OrganizationService {
	private organizationRepository: OrganizationRepository;
	private userRepository: UserRepository;
	private db: PrismaClient;

	constructor(
		db: PrismaClient,
		private env: CloudflareEnv,
	) {
		this.db = db;
		this.organizationRepository = new OrganizationRepository(db);
		this.userRepository = new UserRepository(db);
	}

	/**
	 * 組織を作成
	 */
	async createOrganization(
		userId: string,
		data: {
			name: string;
			displayName: string;
			description?: string;
		},
	) {
		// 名前の形式チェック
		if (!/^[a-z0-9-]+$/.test(data.name)) {
			throw new ORPCError("BAD_REQUEST", {
				message: "組織名は小文字英数字とハイフンのみ使用できます",
			});
		}

		// 組織を作成
		const organization = await this.organizationRepository.create({
			id: nanoid(),
			name: data.name,
			displayName: data.displayName,
			description: data.description || null,
			owner: {
				connect: { id: userId },
			},
		});

		// 作成者をオーナーとして追加
		await this.organizationRepository.addMember(organization.id, userId, "owner");

		return organization;
	}

	/**
	 * 組織情報を取得
	 */
	async getOrganization(nameOrId: string, userId?: string) {
		let organization = await this.organizationRepository.findById(nameOrId, true);

		if (!organization) {
			organization = await this.organizationRepository.findByName(nameOrId);
			if (organization) {
				organization = await this.organizationRepository.findById(organization.id, true);
			}
		}

		if (!organization) {
			throw new ORPCError("NOT_FOUND", {
				message: "組織が見つかりません",
			});
		}

		// メンバー情報を含める場合は、メンバーかどうかチェック
		if (organization.members && userId) {
			const isMember = await this.organizationRepository.isMember(organization.id, userId);
			if (!isMember) {
				// メンバーでない場合はメンバー情報を除外
				delete organization.members;
			}
		}

		return organization;
	}

	/**
	 * 組織を更新
	 */
	async updateOrganization(
		orgId: string,
		userId: string,
		data: {
			displayName?: string;
			description?: string;
		},
	) {
		// オーナー権限チェック
		const isOwner = await this.organizationRepository.isOwner(orgId, userId);
		if (!isOwner) {
			throw new ORPCError("FORBIDDEN", {
				message: "組織を更新する権限がありません",
			});
		}

		return await this.organizationRepository.update(orgId, data);
	}

	/**
	 * 組織を削除
	 */
	async deleteOrganization(orgId: string, userId: string) {
		// オーナー権限チェック
		const isOwner = await this.organizationRepository.isOwner(orgId, userId);
		if (!isOwner) {
			throw new ORPCError("FORBIDDEN", {
				message: "組織を削除する権限がありません",
			});
		}

		await this.organizationRepository.delete(orgId);

		return { success: true, message: "組織が削除されました" };
	}

	/**
	 * メンバーを招待
	 */
	async inviteMember(orgId: string, inviterId: string, email: string, locale = "ja") {
		// 権限チェック（オーナーのみ招待可能）
		const isOwner = await this.organizationRepository.isOwner(orgId, inviterId);
		if (!isOwner) {
			throw new ORPCError("FORBIDDEN", {
				message: "メンバーを招待する権限がありません",
			});
		}

		// 招待するユーザーを検索
		const invitedUser = await this.userRepository.findByEmail(email);
		if (!invitedUser) {
			throw new ORPCError("NOT_FOUND", {
				message: "指定されたメールアドレスのユーザーが見つかりません",
			});
		}

		// 既にメンバーかチェック
		const isMember = await this.organizationRepository.isMember(orgId, invitedUser.id);
		if (isMember) {
			throw new ORPCError("CONFLICT", {
				message: "このユーザーは既にメンバーです",
			});
		}

		// 招待トークンを生成
		const inviteToken = await generateToken(
			{
				orgId,
				userId: invitedUser.id,
				inviterId,
			},
			this.env.JWT_SECRET,
			"7d",
		);

		// 招待メールを送信
		const organization = await this.organizationRepository.findById(orgId);
		if (!organization) {
			throw new ORPCError("NOT_FOUND", {
				message: "組織が見つかりません",
			});
		}

		await this.sendInvitationEmail(email, organization.displayName, inviteToken, locale);

		return { message: "招待メールを送信しました" };
	}

	/**
	 * 招待を受け入れる
	 */
	async acceptInvitation(token: string, userId: string) {
		try {
			const payload = (await verifyToken(token, this.env.JWT_SECRET)) as {
				orgId: string;
				userId: string;
			};

			// トークンのユーザーIDと一致するかチェック
			if (userId !== payload.userId) {
				throw new ORPCError("FORBIDDEN", {
					message: "この招待は別のユーザー宛です",
				});
			}

			// メンバーとして追加
			await this.organizationRepository.addMember(payload.orgId, userId, "member");

			// 組織の情報を取得して返す
			const organization = await this.organizationRepository.findById(payload.orgId);
			if (!organization) {
				throw new ORPCError("NOT_FOUND", {
					message: "組織が見つかりません",
				});
			}

			// オーナー情報を含む組織データを返す
			const owner = await this.db.user.findUnique({
				where: { id: organization.ownerId },
				select: { id: true, username: true, email: true },
			});

			if (!owner) {
				throw new ORPCError("NOT_FOUND", {
					message: "組織のオーナーが見つかりません",
				});
			}

			return {
				...organization,
				owner,
			};
		} catch (error) {
			throw new ORPCError("BAD_REQUEST", {
				message: "無効または期限切れの招待トークンです",
			});
		}
	}

	/**
	 * メンバーを削除
	 */
	async removeMember(orgId: string, requesterId: string, memberId: string) {
		// 自分自身を削除する場合
		if (requesterId === memberId) {
			// オーナーが自分を削除しようとしている場合
			const isOwner = await this.organizationRepository.isOwner(orgId, requesterId);
			if (isOwner) {
				// 他のオーナーがいるかチェック
				const org = await this.organizationRepository.findById(orgId, true);
				const owners = org?.members?.filter((m: OrganizationMember) => m.role === "owner") || [];
				if (owners.length <= 1) {
					throw new ORPCError("BAD_REQUEST", {
						message: "最後のオーナーは組織から退出できません",
					});
				}
			}
		} else {
			// 他のメンバーを削除する場合はオーナー権限が必要
			const isOwner = await this.organizationRepository.isOwner(orgId, requesterId);
			if (!isOwner) {
				throw new ORPCError("FORBIDDEN", {
					message: "メンバーを削除する権限がありません",
				});
			}
		}

		await this.organizationRepository.removeMember(orgId, memberId);

		return { message: "メンバーを削除しました" };
	}

	/**
	 * メンバーの役割を更新
	 */
	async updateMemberRole(
		orgId: string,
		requesterId: string,
		memberId: string,
		role: "owner" | "member",
	) {
		// オーナー権限チェック
		const isOwner = await this.organizationRepository.isOwner(orgId, requesterId);
		if (!isOwner) {
			throw new ORPCError("FORBIDDEN", {
				message: "メンバーの役割を変更する権限がありません",
			});
		}

		// 自分の役割を変更しようとしている場合
		if (requesterId === memberId && role === "member") {
			// 他のオーナーがいるかチェック
			const org = await this.organizationRepository.findById(orgId, true);
			const owners = org?.members?.filter((m: OrganizationMember) => m.role === "owner") || [];
			if (owners.length <= 1) {
				throw new ORPCError("BAD_REQUEST", {
					message: "最後のオーナーの役割は変更できません",
				});
			}
		}

		await this.organizationRepository.updateMemberRole(orgId, memberId, role);

		return { message: "メンバーの役割を更新しました" };
	}

	/**
	 * ユーザーが所属する組織を取得
	 */
	async getUserOrganizations(userId: string) {
		const organizations = await this.organizationRepository.findByUserId(userId);

		// 各組織のメンバー数とルール数を取得
		const result = await Promise.all(
			organizations.map(async (org: Organization) => {
				// メンバー数を取得
				const memberCount = await this.db.organizationMember.count({
					where: { organizationId: org.id },
				});

				// ルール数を取得
				const ruleCount = await this.db.rule.count({
					where: { organizationId: org.id },
				});

				// オーナー情報を取得
				const owner = await this.db.user.findUnique({
					where: { id: org.ownerId },
					select: { id: true, username: true, email: true },
				});

				if (!owner) {
					throw new ORPCError("NOT_FOUND", {
						message: "組織のオーナーが見つかりません",
					});
				}

				return {
					id: org.id,
					name: org.name,
					displayName: org.displayName,
					owner,
					memberCount,
					ruleCount,
				};
			}),
		);

		return result;
	}

	/**
	 * 招待メールを送信
	 */
	private async sendInvitationEmail(email: string, orgName: string, token: string, locale: string) {
		const acceptUrl = `${this.env.FRONTEND_URL}/organizations/accept-invite?token=${token}`;

		const templates = {
			ja: {
				subject: `${orgName}への招待`,
				body: `
					<h2>${orgName}への招待</h2>
					<p>${orgName}に招待されました。</p>
					<p>以下のリンクをクリックして、招待を受け入れてください：</p>
					<a href="${acceptUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">招待を受け入れる</a>
					<p>このリンクは7日間で有効期限が切れます。</p>
					<p>心当たりがない場合は、このメールを無視してください。</p>
				`,
			},
			en: {
				subject: `Invitation to ${orgName}`,
				body: `
					<h2>Invitation to ${orgName}</h2>
					<p>You have been invited to join ${orgName}.</p>
					<p>Please click the link below to accept the invitation:</p>
					<a href="${acceptUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a>
					<p>This link will expire in 7 days.</p>
					<p>If you didn't expect this invitation, please ignore this email.</p>
				`,
			},
		};

		const template = templates[locale as keyof typeof templates] || templates.ja;

		await sendEmail(this.env, email, template.subject, template.body);
	}

	/**
	 * 組織から離脱
	 */
	async leaveOrganization(organizationId: string, userId: string) {
		const member = await this.organizationRepository.findMember(organizationId, userId);
		if (!member) {
			throw new ORPCError("NOT_FOUND", {
				message: "You are not a member of this organization",
			});
		}

		// オーナーは離脱できない
		if (member.role === "owner") {
			throw new ORPCError("FORBIDDEN", {
				message: "Organization owner cannot leave. Transfer ownership first.",
			});
		}

		// メンバーを削除
		await this.organizationRepository.removeMember(organizationId, userId);

		return { success: true, message: "Left organization successfully" };
	}

	/**
	 * ユーザー名でメンバーを招待
	 */
	async inviteMemberByUsername(organizationId: string, inviterId: string, username: string) {
		// オーナー権限チェック
		const isOwner = await this.organizationRepository.isOwner(organizationId, inviterId);
		if (!isOwner) {
			throw new ORPCError("FORBIDDEN", {
				message: "Only organization owners can invite members",
			});
		}

		// ユーザーを検索
		const user = await this.userRepository.findByUsername(username);
		if (!user) {
			throw new ORPCError("NOT_FOUND", {
				message: "User not found",
			});
		}

		// 既にメンバーかチェック
		const existingMember = await this.organizationRepository.findMember(organizationId, user.id);
		if (existingMember) {
			throw new ORPCError("CONFLICT", {
				message: "User is already a member of this organization",
			});
		}

		// Email で招待を送る
		return await this.inviteMember(organizationId, inviterId, user.email, "ja");
	}

	/**
	 * 組織のルール数をカウント
	 */
	async countOrganizationRules(
		organizationId: string,
		options?: { visibility?: "public" | "private" | "team" },
	) {
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic Prisma where clause construction requires flexible typing
		const where: any = { organizationId };

		if (options?.visibility) {
			where.visibility = options.visibility;
		}

		return await this.db.rule.count({ where });
	}

	/**
	 * 組織のルール一覧を取得
	 */
	async listOrganizationRules(
		organizationId: string,
		options?: {
			page?: number;
			pageSize?: number;
			visibility?: "public" | "private" | "team";
			includeStarCount?: boolean;
		},
	) {
		const page = options?.page || 1;
		const pageSize = options?.pageSize || 20;
		const skip = (page - 1) * pageSize;

		// biome-ignore lint/suspicious/noExplicitAny: Dynamic Prisma where clause construction requires flexible typing
		const where: any = { organizationId };

		if (options?.visibility) {
			where.visibility = options.visibility;
		}

		const [rules, total] = await Promise.all([
			this.db.rule.findMany({
				where,
				include: {
					user: {
						select: {
							id: true,
							username: true,
							email: true,
						},
					},
					...(options?.includeStarCount
						? {
								starredBy: {
									select: { id: true },
								},
							}
						: {}),
				},
				orderBy: { updatedAt: "desc" },
				skip,
				take: pageSize,
			}),
			this.db.rule.count({ where }),
		]);

		return {
			rules: rules.map((r) => ({
				id: r.id,
				name: r.name,
				description: r.description,
				visibility: r.visibility as "public" | "private" | "team",
				isPublished: r.publishedAt !== null,
				downloadCount: r.views,
				starCount: options?.includeStarCount ? r.starredBy?.length || r.stars : r.stars,
				createdAt: r.createdAt,
				updatedAt: r.updatedAt,
				user: r.user,
				latestVersion: r.version || "1.0.0",
			})),
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	}

	/**
	 * 組織の公開プロフィール情報を取得
	 */
	async getOrganizationPublicStats(organizationId: string) {
		// 公開ルール数と総スター数を取得
		const [publicRulesCount, totalStars] = await Promise.all([
			this.db.rule.count({
				where: {
					organizationId,
					visibility: "public",
				},
			}),
			this.db.ruleStar.count({
				where: {
					rule: {
						organizationId,
						visibility: "public",
					},
				},
			}),
		]);

		// 公開ルール一覧（スター数付き）
		const publicRules = await this.db.rule.findMany({
			where: {
				organizationId,
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
			stats: {
				publicRulesCount,
				totalStars,
			},
			publicRules: publicRules.map((rule) => ({
				id: rule.id,
				name: rule.name,
				description: rule.description || "",
				stars: rule.starredBy.length,
				createdAt: rule.createdAt,
				updatedAt: rule.updatedAt,
				user: rule.user,
			})),
		};
	}
}
