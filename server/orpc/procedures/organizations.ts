import { ORPCError } from "@orpc/server";
import * as z from "zod";
import { os } from "~/server/orpc";
import { dbWithAuth } from "~/server/orpc/middleware/combined";

export const organizationsProcedures = {
	list: os.use(dbWithAuth).handler(async ({ context }) => {
		const { db, user } = context;

		const organizations = await db.organization.findMany({
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

		return organizations.map((organization) => ({
			id: organization.id,
			name: organization.name,
			displayName: organization.displayName,
			owner: organization.owner,
			memberCount: organization._count.members,
			ruleCount: organization._count.rules,
		}));
	}),

	create: os
		.use(dbWithAuth)
		.input(
			z.object({
				name: z
					.string()
					.min(1)
					.max(50)
					.regex(
						/^[a-zA-Z0-9-]+$/,
						"Organization name can only contain alphanumeric characters and hyphens",
					),
				displayName: z.string().min(1).max(100).optional(),
				description: z.string().max(500).optional(),
				inviteEmails: z.array(z.string().email()).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;
			const { generateId } = await import("~/server/utils/crypto");

			// Check if organization name already exists
			const existingOrganization = await db.organization.findFirst({
				where: {
					name: input.name,
				},
			});

			if (existingOrganization) {
				throw new ORPCError("CONFLICT", {
					message: "A organization with this name already exists",
				});
			}

			// Create organization
			const organizationId = generateId();
			const organization = await db.organization.create({
				data: {
					id: organizationId,
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
					await db.organizationInvitation.create({
						data: {
							id: generateId(),
							organizationId: organization.id,
							email: email.toLowerCase(),
							token: invitationToken,
							invitedBy: user.id,
							expiresAt,
						},
					});

					// Send invitation email
					const emailTemplate = emailService.generateOrganizationInvitationEmail({
						email,
						organizationName: organization.displayName || organization.name,
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
				id: organization.id,
				name: organization.name,
				displayName: organization.displayName,
				description: organization.description,
				owner: organization.owner,
				createdAt: organization.createdAt,
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

			const organization = await db.organization.findUnique({
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

			if (!organization) {
				throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
			}

			// Check if user is a member
			if (organization.members.length === 0) {
				throw new ORPCError("FORBIDDEN", { message: "You are not a member of this organization" });
			}

			return {
				id: organization.id,
				name: organization.name,
				displayName: organization.displayName,
				description: organization.description,
				owner: organization.owner,
				role: organization.members[0].role as "owner" | "member",
				memberCount: organization._count.members,
				ruleCount: organization._count.rules,
				createdAt: organization.createdAt,
			};
		}),

	members: os
		.use(dbWithAuth)
		.input(
			z.object({
				organizationId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Check if user is a member of the organization
			const membership = await db.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: user.id,
				},
			});

			if (!membership) {
				throw new ORPCError("FORBIDDEN", { message: "You are not a member of this organization" });
			}

			const members = await db.organizationMember.findMany({
				where: {
					organizationId: input.organizationId,
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
				organizationId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Check if user is a member of the organization
			const membership = await db.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: user.id,
				},
			});

			if (!membership) {
				throw new ORPCError("FORBIDDEN", { message: "You are not a member of this organization" });
			}

			const rules = await db.rule.findMany({
				where: {
					organizationId: input.organizationId,
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
			const invitation = await db.organizationInvitation.findUnique({
				where: { token: input.token },
				include: {
					organization: {
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
			const existingMember = await db.organizationMember.findUnique({
				where: {
					// biome-ignore lint/style/useNamingConvention: Prismaの命名規則に従うしかない
					organizationId_userId: {
						organizationId: invitation.organizationId,
						userId: user.id,
					},
				},
			});

			if (existingMember) {
				// Delete the invitation since they're already a member
				await db.organizationInvitation.delete({
					where: { id: invitation.id },
				});

				return {
					success: true,
					message: "You are already a member of this organization",
					organization: invitation.organization,
				};
			}

			// Create organization membership
			const { generateId } = await import("~/server/utils/crypto");
			await db.organizationMember.create({
				data: {
					id: generateId(),
					organizationId: invitation.organizationId,
					userId: user.id,
					role: "member",
				},
			});

			// Delete the invitation
			await db.organizationInvitation.delete({
				where: { id: invitation.id },
			});

			return {
				success: true,
				message: "Successfully joined the organization",
				organization: invitation.organization,
			};
		}),

	update: os
		.use(dbWithAuth)
		.input(
			z.object({
				id: z.string(),
				name: z
					.string()
					.min(1)
					.max(50)
					.regex(/^[a-zA-Z0-9-]+$/)
					.optional(),
				displayName: z.string().min(1).max(100).optional(),
				description: z.string().max(500).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;
			const { id, ...updateData } = input;

			// Check if user is the owner of the organization
			const membership = await db.organizationMember.findFirst({
				where: {
					organizationId: id,
					userId: user.id,
					role: "owner",
				},
			});

			if (!membership) {
				throw new ORPCError("FORBIDDEN", {
					message: "Only organization owners can update organization details",
				});
			}

			// Check if new name is already taken
			if (updateData.name) {
				const existingOrg = await db.organization.findFirst({
					where: {
						name: updateData.name,
						id: { not: id },
					},
				});

				if (existingOrg) {
					throw new ORPCError("CONFLICT", {
						message: "An organization with this name already exists",
					});
				}
			}

			const updated = await db.organization.update({
				where: { id },
				data: updateData,
			});

			return {
				success: true,
				organization: updated,
			};
		}),

	delete: os
		.use(dbWithAuth)
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Check if user is the owner of the organization
			const membership = await db.organizationMember.findFirst({
				where: {
					organizationId: input.id,
					userId: user.id,
					role: "owner",
				},
			});

			if (!membership) {
				throw new ORPCError("FORBIDDEN", {
					message: "Only organization owners can delete the organization",
				});
			}

			// Delete the organization (cascade will handle related records)
			await db.organization.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	removeMember: os
		.use(dbWithAuth)
		.input(
			z.object({
				organizationId: z.string(),
				userId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Check if user is an owner of the organization
			const requesterMembership = await db.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: user.id,
					role: "owner",
				},
			});

			if (!requesterMembership) {
				throw new ORPCError("FORBIDDEN", {
					message: "Only organization owners can remove members",
				});
			}

			// Check if target user is a member
			const targetMembership = await db.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: input.userId,
				},
			});

			if (!targetMembership) {
				throw new ORPCError("NOT_FOUND", { message: "User is not a member of this organization" });
			}

			// Prevent removing the last owner
			if (targetMembership.role === "owner") {
				const ownerCount = await db.organizationMember.count({
					where: {
						organizationId: input.organizationId,
						role: "owner",
					},
				});

				if (ownerCount <= 1) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Cannot remove the last owner of the organization",
					});
				}
			}

			// Remove the member
			await db.organizationMember.delete({
				where: {
					id: targetMembership.id,
				},
			});

			return { success: true };
		}),

	leave: os
		.use(dbWithAuth)
		.input(
			z.object({
				organizationId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, user } = context;

			// Check if user is a member
			const membership = await db.organizationMember.findFirst({
				where: {
					organizationId: input.organizationId,
					userId: user.id,
				},
			});

			if (!membership) {
				throw new ORPCError("NOT_FOUND", { message: "You are not a member of this organization" });
			}

			// Prevent the last owner from leaving
			if (membership.role === "owner") {
				const ownerCount = await db.organizationMember.count({
					where: {
						organizationId: input.organizationId,
						role: "owner",
					},
				});

				if (ownerCount <= 1) {
					throw new ORPCError("BAD_REQUEST", {
						message:
							"The last owner cannot leave the organization. Transfer ownership or delete the organization instead.",
					});
				}
			}

			// Remove the membership
			await db.organizationMember.delete({
				where: {
					id: membership.id,
				},
			});

			return { success: true };
		}),
};
