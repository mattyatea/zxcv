import { ORPCError } from "@orpc/server";
import * as z from "zod";
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
						rules: true,
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
			ruleCount: team._count.rules,
		}));
	}),

	create: os
		.use(dbWithAuth)
		.input(
			z.object({
				name: z.string().min(1).max(50),
				displayName: z.string().min(1).max(100).optional(),
				description: z.string().max(500).optional(),
				inviteEmails: z.array(z.string().email()).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;
			const { generateId } = await import("~/server/utils/crypto");

			// Check if team name already exists
			const existingTeam = await db.team.findFirst({
				where: {
					name: input.name,
				},
			});

			if (existingTeam) {
				throw new ORPCError("CONFLICT", { message: "A team with this name already exists" });
			}

			// Create team
			const teamId = generateId();
			const team = await db.team.create({
				data: {
					id: teamId,
					name: input.name,
					displayName: input.displayName || input.name,
					description: input.description,
					ownerId: user.id,
					members: {
						create: {
							id: generateId(),
							userId: user.id,
							role: "owner",
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
				},
			});

			// Send invite emails if provided
			if (input.inviteEmails && input.inviteEmails.length > 0) {
				const { EmailService } = await import("~/server/utils/email");
				const emailService = new EmailService(context.env);
				const { generateId } = await import("~/server/utils/crypto");

				// Create invitation records and send emails
				for (const email of input.inviteEmails) {
					const invitationToken = generateId();
					const expiresAt = Math.floor(Date.now() / 1000) + 604800; // 7 days

					// Create invitation record
					await db.teamInvitation.create({
						data: {
							id: generateId(),
							teamId: team.id,
							email: email.toLowerCase(),
							token: invitationToken,
							invitedBy: user.id,
							expiresAt,
						},
					});

					// Send invitation email
					const emailTemplate = emailService.generateTeamInvitationEmail({
						email,
						teamName: team.displayName || team.name,
						inviterName: user.username,
						invitationToken,
						userLocale: "ja", // Default to Japanese for now
					});

					try {
						await emailService.sendEmail(emailTemplate);
					} catch (error) {
						console.error("Failed to send invitation email:", error);
						// Continue with other invitations even if one fails
					}
				}
			}

			return {
				id: team.id,
				name: team.name,
				displayName: team.displayName,
				description: team.description,
				owner: team.owner,
				createdAt: team.createdAt,
			};
		}),

	get: os
		.use(dbWithAuth)
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			const team = await db.team.findUnique({
				where: { id: input.id },
				include: {
					owner: {
						select: {
							id: true,
							username: true,
							email: true,
						},
					},
					members: {
						where: {
							userId: user.id,
						},
						select: {
							role: true,
						},
					},
					// biome-ignore lint/style/useNamingConvention: Prisma _count field
					_count: {
						select: {
							members: true,
							rules: true,
						},
					},
				},
			});

			if (!team) {
				throw new ORPCError("NOT_FOUND", { message: "Team not found" });
			}

			// Check if user is a member
			if (team.members.length === 0) {
				throw new ORPCError("FORBIDDEN", { message: "You are not a member of this team" });
			}

			return {
				id: team.id,
				name: team.name,
				displayName: team.displayName,
				description: team.description,
				owner: team.owner,
				role: team.members[0].role as "owner" | "member",
				memberCount: team._count.members,
				ruleCount: team._count.rules,
				createdAt: team.createdAt,
			};
		}),

	members: os
		.use(dbWithAuth)
		.input(
			z.object({
				teamId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Check if user is a member of the team
			const membership = await db.teamMember.findFirst({
				where: {
					teamId: input.teamId,
					userId: user.id,
				},
			});

			if (!membership) {
				throw new ORPCError("FORBIDDEN", { message: "You are not a member of this team" });
			}

			const members = await db.teamMember.findMany({
				where: {
					teamId: input.teamId,
				},
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
					{ role: "asc" }, // owners first
					{ joinedAt: "asc" },
				],
			});

			return members.map((member) => ({
				id: member.user.id,
				username: member.user.username,
				email: member.user.email,
				role: member.role as "owner" | "member",
				joinedAt: member.joinedAt,
			}));
		}),

	rules: os
		.use(dbWithAuth)
		.input(
			z.object({
				teamId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Check if user is a member of the team
			const membership = await db.teamMember.findFirst({
				where: {
					teamId: input.teamId,
					userId: user.id,
				},
			});

			if (!membership) {
				throw new ORPCError("FORBIDDEN", { message: "You are not a member of this team" });
			}

			const rules = await db.rule.findMany({
				where: {
					teamId: input.teamId,
				},
				include: {
					user: {
						select: {
							id: true,
							username: true,
						},
					},
				},
				orderBy: {
					updatedAt: "desc",
				},
			});

			return rules.map((rule) => ({
				id: rule.id,
				name: rule.name,
				description: rule.description,
				version: rule.version,
				updatedAt: rule.updatedAt,
				author: rule.user,
			}));
		}),

	acceptInvitation: os
		.use(dbWithAuth)
		.input(
			z.object({
				token: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;
			const now = Math.floor(Date.now() / 1000);

			// Find valid invitation
			const invitation = await db.teamInvitation.findUnique({
				where: { token: input.token },
				include: {
					team: {
						include: {
							owner: {
								select: {
									id: true,
									username: true,
									email: true,
								},
							},
						},
					},
				},
			});

			if (!invitation || invitation.expiresAt < now) {
				throw new ORPCError("BAD_REQUEST", { message: "Invalid or expired invitation" });
			}

			// Check if user's email matches the invitation email
			if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
				throw new ORPCError("FORBIDDEN", {
					message: "This invitation was sent to a different email address",
				});
			}

			// Check if user is already a member
			const existingMember = await db.teamMember.findUnique({
				where: {
					// biome-ignore lint/style/useNamingConvention: Prismaの命名規則に従うしかない
					teamId_userId: {
						teamId: invitation.teamId,
						userId: user.id,
					},
				},
			});

			if (existingMember) {
				// Delete the invitation since they're already a member
				await db.teamInvitation.delete({
					where: { id: invitation.id },
				});

				return {
					success: true,
					message: "You are already a member of this team",
					team: invitation.team,
				};
			}

			// Create team membership
			const { generateId } = await import("~/server/utils/crypto");
			await db.teamMember.create({
				data: {
					id: generateId(),
					teamId: invitation.teamId,
					userId: user.id,
					role: "member",
				},
			});

			// Delete the invitation
			await db.teamInvitation.delete({
				where: { id: invitation.id },
			});

			return {
				success: true,
				message: "Successfully joined the team",
				team: invitation.team,
			};
		}),
};
