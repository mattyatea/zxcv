import { ORPCError } from "@orpc/server";
import type { Organization, OrganizationMember, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { BaseRepository } from "./BaseRepository";

type OrganizationWithMembers = Organization & {
	members?: OrganizationMember[];
};

export class OrganizationRepository extends BaseRepository {
	/**
	 * 組織を作成
	 */
	async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
		try {
			return await this.db.organization.create({
				data: {
					...data,
					createdAt: this.getCurrentTimestamp(),
					updatedAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			if (this.isDuplicateError(error)) {
				throw new ORPCError("CONFLICT", {
					message: "この組織名は既に使用されています",
				});
			}
			this.handleError(error, "組織の作成に失敗しました");
		}
	}

	/**
	 * 組織をIDで取得
	 */
	async findById(
		id: string,
		includeMembers = false,
	): Promise<OrganizationWithMembers | null> {
		try {
			return await this.db.organization.findUnique({
				where: { id },
				include: includeMembers ? { members: true } : undefined,
			});
		} catch (error) {
			this.handleError(error, "組織の取得に失敗しました");
		}
	}

	/**
	 * 組織を名前で取得
	 */
	async findByName(name: string): Promise<Organization | null> {
		try {
			return await this.db.organization.findUnique({
				where: { name },
			});
		} catch (error) {
			this.handleError(error, "組織の取得に失敗しました");
		}
	}

	/**
	 * ユーザーが所属する組織を取得
	 */
	async findByUserId(
		userId: string,
	): Promise<Array<Organization & { role: string }>> {
		try {
			const memberships = await this.db.organizationMember.findMany({
				where: { userId },
				include: { organization: true },
			});

			return memberships.map((m) => ({
				...m.organization,
				role: m.role,
			}));
		} catch (error) {
			this.handleError(error, "所属組織の取得に失敗しました");
		}
	}

	/**
	 * メンバーを追加
	 */
	async addMember(
		orgId: string,
		userId: string,
		role: "owner" | "member" = "member",
	): Promise<OrganizationMember> {
		try {
			return await this.db.organizationMember.create({
				data: {
					id: nanoid(),
					organizationId: orgId,
					userId,
					role,
					joinedAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			if (this.isDuplicateError(error)) {
				throw new ORPCError("CONFLICT", {
					message: "このユーザーは既にメンバーです",
				});
			}
			this.handleError(error, "メンバーの追加に失敗しました");
		}
	}

	/**
	 * メンバーを削除
	 */
	async removeMember(orgId: string, userId: string): Promise<void> {
		try {
			await this.db.organizationMember.delete({
				where: {
					// biome-ignore lint/style/useNamingConvention: Prisma compound key
					organizationId_userId: {
						organizationId: orgId,
						userId,
					},
				},
			});
		} catch (error) {
			this.handleError(error, "メンバーの削除に失敗しました");
		}
	}

	/**
	 * メンバーの役割を更新
	 */
	async updateMemberRole(
		orgId: string,
		userId: string,
		role: "owner" | "member",
	): Promise<OrganizationMember> {
		try {
			return await this.db.organizationMember.update({
				where: {
					// biome-ignore lint/style/useNamingConvention: Prisma compound key
					organizationId_userId: {
						organizationId: orgId,
						userId,
					},
				},
				data: { role },
			});
		} catch (error) {
			this.handleError(error, "メンバーの役割更新に失敗しました");
		}
	}

	/**
	 * 組織を更新
	 */
	async update(
		id: string,
		data: Prisma.OrganizationUpdateInput,
	): Promise<Organization> {
		try {
			return await this.db.organization.update({
				where: { id },
				data: {
					...data,
					updatedAt: this.getCurrentTimestamp(),
				},
			});
		} catch (error) {
			this.handleError(error, "組織の更新に失敗しました");
		}
	}

	/**
	 * 組織を削除
	 */
	async delete(id: string): Promise<void> {
		try {
			// メンバーシップを削除
			await this.db.organizationMember.deleteMany({
				where: { organizationId: id },
			});

			// 組織を削除
			await this.db.organization.delete({
				where: { id },
			});
		} catch (error) {
			this.handleError(error, "組織の削除に失敗しました");
		}
	}

	/**
	 * ユーザーが組織のメンバーかチェック
	 */
	async isMember(orgId: string, userId: string): Promise<boolean> {
		try {
			const member = await this.db.organizationMember.findUnique({
				where: {
					// biome-ignore lint/style/useNamingConvention: Prisma compound key
					organizationId_userId: {
						organizationId: orgId,
						userId,
					},
				},
			});
			return member !== null;
		} catch (error) {
			this.handleError(error, "メンバーシップの確認に失敗しました");
		}
	}

	/**
	 * Find a specific member
	 */
	async findMember(
		orgId: string,
		userId: string,
	): Promise<OrganizationMember | null> {
		try {
			return await this.db.organizationMember.findUnique({
				where: {
					// biome-ignore lint/style/useNamingConvention: Prisma composite key format
					organizationId_userId: {
						organizationId: orgId,
						userId,
					},
				},
			});
		} catch (error) {
			this.handleError(error, "Failed to find member");
		}
	}

	/**
	 * ユーザーが組織のオーナーかチェック
	 */
	async isOwner(orgId: string, userId: string): Promise<boolean> {
		try {
			const member = await this.db.organizationMember.findUnique({
				where: {
					// biome-ignore lint/style/useNamingConvention: Prisma compound key
					organizationId_userId: {
						organizationId: orgId,
						userId,
					},
				},
			});
			return member?.role === "owner";
		} catch (error) {
			this.handleError(error, "オーナーシップの確認に失敗しました");
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
