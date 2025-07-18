import { z } from "zod";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import { requireAuth } from "~/server/utils/auth";

const paramsSchema = z.object({
  id: z.string(),
});

const bodySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9-_]+$/)
    .optional(),
  displayName: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const params = await getValidatedRouterParams(event, paramsSchema.parse);
  const { id } = params;
  
  const updates = await readValidatedBody(event, bodySchema.parse);

  if (!updates.name && !updates.displayName && updates.description === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "At least one field must be provided",
    });
  }

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

    // Check if user is owner or admin of this team
    const team = await prisma.team.findFirst({
      where: {
        id,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
                role: "admin",
              },
            },
          },
        ],
      },
    });

    if (!team) {
      throw createError({
        statusCode: 403,
        statusMessage: "Not authorized to update this team",
      });
    }

    // Check if new name already exists (if name is being updated)
    if (updates.name && updates.name !== team.name) {
      const existingTeam = await prisma.team.findFirst({
        where: {
          name: updates.name,
          id: {
            not: id,
          },
        },
      });

      if (existingTeam) {
        throw createError({
          statusCode: 409,
          statusMessage: "Team name already exists",
        });
      }
    }

    // Update team
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: Math.floor(Date.now() / 1000),
      },
    });

    return {
      id: updatedTeam.id,
      name: updatedTeam.name,
      displayName: updatedTeam.displayName,
      description: updatedTeam.description,
      ownerId: updatedTeam.ownerId,
      createdAt: updatedTeam.createdAt,
      updatedAt: updatedTeam.updatedAt,
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw createError({
      statusCode: prismaError.status,
      statusMessage: prismaError.message,
    });
  }
});