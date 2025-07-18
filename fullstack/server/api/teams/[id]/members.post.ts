import { z } from "zod";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import { requireAuth } from "~/server/utils/auth";
import { generateId } from "~/server/utils/crypto";

const paramsSchema = z.object({
  id: z.string(),
});

const bodySchema = z.object({
  userId: z.string(),
  role: z.enum(["admin", "member"]).default("member"),
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const params = await getValidatedRouterParams(event, paramsSchema.parse);
  const { id } = params;
  
  const body = await readValidatedBody(event, bodySchema.parse);
  const { userId, role } = body;

  const prisma = createPrismaClient(event.context.cloudflare.env.DB);

  try {
    // Check if current user is owner or admin of this team
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
      // Check if team exists
      const teamExists = await prisma.team.findUnique({
        where: { id },
      });

      if (!teamExists) {
        throw createError({
          statusCode: 404,
          statusMessage: "Team not found",
        });
      }

      throw createError({
        statusCode: 403,
        statusMessage: "Not authorized to add members",
      });
    }

    // Check if the user to be added exists
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!userToAdd) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: userId,
      },
    });

    if (existingMember) {
      throw createError({
        statusCode: 409,
        statusMessage: "User is already a member",
      });
    }

    // Add user to team
    const now = Math.floor(Date.now() / 1000);
    const teamMember = await prisma.teamMember.create({
      data: {
        id: generateId(),
        teamId: id,
        userId: userId,
        role,
        joinedAt: now,
      },
    });

    setResponseStatus(event, 201);
    return {
      userId: userToAdd.id,
      username: userToAdd.username,
      email: userToAdd.email,
      role: teamMember.role,
      joinedAt: teamMember.joinedAt,
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw createError({
      statusCode: prismaError.status,
      statusMessage: prismaError.message,
    });
  }
});