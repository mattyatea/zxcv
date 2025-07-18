import { z } from "zod";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import { requireAuth } from "~/server/utils/auth";

const paramsSchema = z.object({
  id: z.string(),
  userId: z.string(),
});

const bodySchema = z.object({
  role: z.enum(["admin", "member"]),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const params = await getValidatedRouterParams(event, paramsSchema.parse);
  const { id, userId } = params;
  
  const body = await readValidatedBody(event, bodySchema.parse);
  const { role } = body;

  const prisma = createPrismaClient(event.context.cloudflare.env.DB);

  try {
    // Get team and check authorization
    const team = await prisma.team.findFirst({
      where: { id },
      include: {
        members: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (!team) {
      throw createError({
        statusCode: 404,
        statusMessage: "Team not found",
      });
    }

    const currentUserMember = team.members[0];
    const isOwner = team.ownerId === user.id;
    const isAdmin = currentUserMember?.role === "admin";

    // Check if user can update member roles
    if (!isOwner && !isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: "Not authorized to update member roles",
      });
    }

    // Cannot change owner's role
    if (userId === team.ownerId) {
      throw createError({
        statusCode: 403,
        statusMessage: "Cannot change team owner's role",
      });
    }

    // Check if the member to be updated exists
    const memberToUpdate = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!memberToUpdate) {
      throw createError({
        statusCode: 404,
        statusMessage: "Member not found",
      });
    }

    // Update member role
    const updatedMember = await prisma.teamMember.update({
      where: {
        id: memberToUpdate.id,
      },
      data: {
        role,
      },
    });

    return {
      userId: userId,
      username: memberToUpdate.user.username,
      email: memberToUpdate.user.email,
      role: updatedMember.role,
      joinedAt: updatedMember.joinedAt,
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw createError({
      statusCode: prismaError.status,
      statusMessage: prismaError.message,
    });
  }
});