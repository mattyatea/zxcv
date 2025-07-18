import { z } from "zod";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import { requireAuth } from "~/server/utils/auth";

const paramsSchema = z.object({
  id: z.string(),
});

interface TeamWithDetails {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
  members: Array<{
    userId: string;
    role: string;
    joinedAt: number;
    user: {
      username: string;
      email: string;
    };
  }>;
  // biome-ignore lint/style/useNamingConvention: Prisma generated field
  _count: {
    rules: number;
  };
}

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

    // Check if user is a member of this team and get team details
    const team: TeamWithDetails | null = await prisma.team.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        // biome-ignore lint/style/useNamingConvention: Prisma generated field
        _count: {
          select: {
            rules: true,
          },
        },
      },
    });

    if (!team) {
      throw createError({
        statusCode: 403,
        statusMessage: "Not a member of this team",
      });
    }

    // Get user's role in the team
    const userMember = team.members.find((member) => member.userId === user.id);
    const userRole = userMember?.role || "member";

    // Format members
    const members = team.members.map((member) => ({
      userId: member.userId,
      username: member.user.username,
      email: member.user.email,
      role: member.role,
      joinedAt: member.joinedAt,
    }));

    return {
      id: team.id,
      name: team.name,
      displayName: team.displayName,
      description: team.description,
      ownerId: team.ownerId,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      role: userRole,
      members,
      ruleCount: team._count.rules,
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw createError({
      statusCode: prismaError.status,
      statusMessage: prismaError.message,
    });
  }
});