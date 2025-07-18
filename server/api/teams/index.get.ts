import { z } from "zod";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import { requireAuth } from "~/server/utils/auth";
import { openAPIRegistry } from "~/server/utils/openapi-registry";
import { zodToOpenAPISchema } from "~/server/utils/openapi";

const querySchema = z.object({
  limit: z.string().optional().default("20"),
  offset: z.string().optional().default("0"),
});

// Register OpenAPI schema
openAPIRegistry.registerPath('/teams', 'GET', {
  operationId: 'getTeams',
  summary: 'Get user\'s teams',
  description: 'Get all teams where the authenticated user is a member',
  tags: ['Teams'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'limit',
      in: 'query',
      description: 'Number of teams to return',
      required: false,
      schema: { type: 'string', default: '20' },
    },
    {
      name: 'offset',
      in: 'query',
      description: 'Number of teams to skip',
      required: false,
      schema: { type: 'string', default: '0' },
    },
  ],
  responses: {
    '200': {
      description: 'Teams retrieved successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              results: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    displayName: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    ownerId: { type: 'string' },
                    createdAt: { type: 'integer' },
                    updatedAt: { type: 'integer' },
                    role: { type: 'string', enum: ['owner', 'admin', 'member'] },
                    memberCount: { type: 'integer' },
                  },
                  required: ['id', 'name', 'displayName', 'ownerId', 'createdAt', 'updatedAt', 'role', 'memberCount'],
                },
              },
              total: { type: 'integer' },
              limit: { type: 'integer' },
              offset: { type: 'integer' },
            },
            required: ['results', 'total', 'limit', 'offset'],
          },
        },
      },
    },
    '401': {
      description: 'Authentication required',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '500': {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },
});

interface TeamWithCount {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
  members: Array<{ role: string }>;
  // biome-ignore lint/style/useNamingConvention: Prisma generated field
  _count: {
    members: number;
  };
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  
  const query = await getValidatedQuery(event, querySchema.parse);
  const limit = Number.parseInt(query.limit);
  const offset = Number.parseInt(query.offset);

  const prisma = createPrismaClient(event.context.cloudflare.env.DB);

  try {
    // Get teams where user is a member
    const teamsWithRole = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          where: {
            userId: user.id,
          },
          select: {
            role: true,
          },
        },
        // biome-ignore lint/style/useNamingConvention: Prisma generated field
        _count: {
          select: {
            members: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Get total count
    const totalCount = await prisma.team.count({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    const results = teamsWithRole.map((team: TeamWithCount) => ({
      id: team.id,
      name: team.name,
      displayName: team.displayName,
      description: team.description,
      ownerId: team.ownerId,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      role: team.members[0]?.role || "member",
      memberCount: team._count.members,
    }));

    return {
      results,
      total: totalCount,
      limit,
      offset,
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw createError({
      statusCode: prismaError.status,
      statusMessage: prismaError.message,
    });
  }
});