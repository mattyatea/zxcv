import { z } from "zod";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import { requireAuth } from "~/server/utils/auth";

const paramsSchema = z.object({
  id: z.string(),
  userId: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const params = await getValidatedRouterParams(event, paramsSchema.parse);
  const { id, userId } = params;

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

    // Users can remove themselves
    const isSelfRemoval = userId === user.id;

    // Check if user can remove members
    if (!isOwner && !isAdmin && !isSelfRemoval) {
      throw createError({
        statusCode: 403,
        statusMessage: "Not authorized to remove members",
      });
    }

    // Owner cannot be removed at all
    if (userId === team.ownerId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot remove team owner",
      });
    }

    // Check if the member to be removed exists
    const memberToRemove = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId,
      },
    });

    if (!memberToRemove) {
      throw createError({
        statusCode: 404,
        statusMessage: "Member not found",
      });
    }

    // Remove member
    await prisma.teamMember.delete({
      where: {
        id: memberToRemove.id,
      },
    });

    // Return null with 204 status
    setResponseStatus(event, 204);
    return null;
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw createError({
      statusCode: prismaError.status,
      statusMessage: prismaError.message,
    });
  }
});