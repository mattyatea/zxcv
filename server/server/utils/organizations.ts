import type { PrismaClient } from "@prisma/client";

export interface OrganizationMember {
	id: string;
	organizationId: string;
	userId: string;
	role: "owner" | "admin" | "member" | "viewer";
	joinedAt: number;
}

export async function checkOrganizationMembership(
	prisma: PrismaClient,
	userId: string,
	organizationId: string,
): Promise<OrganizationMember | null> {
	const member = await prisma.organizationMember.findUnique({
		where: {
			// biome-ignore lint/style/useNamingConvention: Prisma generated composite key
			organizationId_userId: {
				organizationId,
				userId,
			},
		},
	});

	if (!member) {
		return null;
	}

	return {
		id: member.id,
		organizationId: member.organizationId,
		userId: member.userId,
		role: member.role as "owner" | "admin" | "member" | "viewer",
		joinedAt: member.joinedAt,
	};
}

export async function canViewOrganizationRule(
	prisma: PrismaClient,
	userId: string,
	organizationId: string,
): Promise<boolean> {
	const member = await checkOrganizationMembership(prisma, userId, organizationId);
	return member !== null;
}

export async function canEditOrganizationRule(
	prisma: PrismaClient,
	userId: string,
	organizationId: string,
): Promise<boolean> {
	const member = await checkOrganizationMembership(prisma, userId, organizationId);
	return member !== null && ["owner", "admin", "member"].includes(member.role);
}

export async function canDeleteOrganizationRule(
	prisma: PrismaClient,
	userId: string,
	organizationId: string,
): Promise<boolean> {
	const member = await checkOrganizationMembership(prisma, userId, organizationId);
	return member !== null && ["owner", "admin"].includes(member.role);
}

export async function isOrganizationOwner(
	prisma: PrismaClient,
	userId: string,
	organizationId: string,
): Promise<boolean> {
	const member = await checkOrganizationMembership(prisma, userId, organizationId);
	return member !== null && member.role === "owner";
}
