import type { PrismaClient } from "@prisma/client";

export interface TeamMember {
	id: string;
	teamId: string;
	userId: string;
	role: "owner" | "admin" | "member" | "viewer";
	joinedAt: number;
}

export async function checkTeamMembership(
	prisma: PrismaClient,
	userId: string,
	teamId: string,
): Promise<TeamMember | null> {
	const member = await prisma.teamMember.findUnique({
		where: {
			// biome-ignore lint/style/useNamingConvention: Prisma generated composite key
			teamId_userId: {
				teamId,
				userId,
			},
		},
	});

	if (!member) {
		return null;
	}

	return {
		id: member.id,
		teamId: member.teamId,
		userId: member.userId,
		role: member.role as "owner" | "admin" | "member" | "viewer",
		joinedAt: member.joinedAt,
	};
}

export async function canViewTeamRule(
	prisma: PrismaClient,
	userId: string,
	teamId: string,
): Promise<boolean> {
	const member = await checkTeamMembership(prisma, userId, teamId);
	return member !== null;
}

export async function canEditTeamRule(
	prisma: PrismaClient,
	userId: string,
	teamId: string,
): Promise<boolean> {
	const member = await checkTeamMembership(prisma, userId, teamId);
	return member !== null && ["owner", "admin", "member"].includes(member.role);
}

export async function canDeleteTeamRule(
	prisma: PrismaClient,
	userId: string,
	teamId: string,
): Promise<boolean> {
	const member = await checkTeamMembership(prisma, userId, teamId);
	return member !== null && ["owner", "admin"].includes(member.role);
}

export async function isTeamOwner(
	prisma: PrismaClient,
	userId: string,
	teamId: string,
): Promise<boolean> {
	const member = await checkTeamMembership(prisma, userId, teamId);
	return member !== null && member.role === "owner";
}
