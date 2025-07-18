import { z } from "zod";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import { requireAuth } from "~/server/utils/auth";

const paramsSchema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const params = await getValidatedRouterParams(event, paramsSchema.parse);
  const { id } = params;

  const prisma = createPrismaClient(event.context.cloudflare.env.DB);

  try {
    // First check if team exists
    const teamExists = await prisma.team.findUnique({
      where: { id },
    });

    if (!teamExists) {
      throw createError({
        statusCode: 404,
        statusMessage: "Team not found",
      });
    }

    // Check if user is owner of this team
    const team = await prisma.team.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    });

    if (!team) {
      throw createError({
        statusCode: 403,
        statusMessage: "Not authorized to delete this team",
      });
    }

    // Delete team (cascading will handle team members)
    await prisma.team.delete({
      where: { id },
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