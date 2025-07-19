import { os } from "~/server/orpc";
import { dbWithAuth } from "~/server/orpc/middleware/combined";

export const teamsProcedures = {
	list: os.use(dbWithAuth).handler(async ({ context }) => {
		const { db, user } = context;

		const teams = await db.team.findMany({
			where: {
				members: {
					some: {
						userId: user.id,
					},
				},
			},
			include: {
				owner: {
					select: {
						id: true,
						username: true,
						email: true,
					},
				},
				// biome-ignore lint/style/useNamingConvention: Prisma の命名規則に従うため、_count を使用するしかない
				_count: {
					select: {
						members: true,
					},
				},
			},
		});

		return teams.map((team) => ({
			id: team.id,
			name: team.name,
			displayName: team.displayName,
			owner: team.owner,
			memberCount: team._count.members,
		}));
	}),
};
