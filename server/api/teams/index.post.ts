import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { requireEmailVerification, getAuthFromEvent } from "~/server/utils/auth";
import { generateId } from "~/server/utils/crypto";
import { createPrismaClient } from "~/server/utils/prisma";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import { openAPIRegistry } from "~/server/utils/openapi-registry";
import { zodToOpenAPISchema } from "~/server/utils/openapi";

const createTeamSchema = z.object({
	name: z
		.string()
		.min(1)
		.max(50)
		.regex(/^[a-zA-Z0-9-_]+$/),
	displayName: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
});

// Register OpenAPI schema
openAPIRegistry.registerPath('/teams', 'POST', {
	operationId: 'createTeam',
	summary: 'Create a new team',
	description: 'Create a new team and add the creator as an admin member',
	tags: ['Teams'],
	security: [{ bearerAuth: [] }],
	requestBody: {
		description: 'Team creation data',
		required: true,
		content: {
			'application/json': {
				schema: zodToOpenAPISchema(createTeamSchema),
			},
		},
	},
	responses: {
		'201': {
			description: 'Team created successfully',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/Team' },
				},
			},
		},
		'400': {
			description: 'Invalid input data',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/Error' },
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
		'403': {
			description: 'Insufficient scope',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/Error' },
				},
			},
		},
		'409': {
			description: 'Team name already exists',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/Error' },
				},
			},
		},
	},
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Require authentication and email verification
	const user = await requireEmailVerification(event);
	
	// Check scope for API key authentication
	const auth = await getAuthFromEvent(event);
	if (auth.apiKeyScopes && !auth.apiKeyScopes.includes("teams:write")) {
		throw createError({
			statusCode: 403,
			statusMessage: "Insufficient scope",
		});
	}
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = createTeamSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const { name, displayName, description } = validation.data;
	
	const prisma = createPrismaClient(env.DB);
	
	try {
		const teamId = generateId();
		const now = Math.floor(Date.now() / 1000);
		
		const team = await prisma.team.create({
			data: {
				id: teamId,
				name,
				displayName: displayName,
				description: description || null,
				ownerId: user.id,
				createdAt: now,
				updatedAt: now,
			},
		});
		
		// Add the creator as a team member with admin role
		await prisma.teamMember.create({
			data: {
				id: generateId(),
				teamId: team.id,
				userId: user.id,
				role: "admin",
				joinedAt: now,
			},
		});
		
		setResponseStatus(event, 201);
		return {
			id: team.id,
			name: team.name,
			displayName: team.displayName,
			description: team.description,
			ownerId: team.ownerId,
			createdAt: team.createdAt,
			updatedAt: team.updatedAt,
		};
	} catch (error) {
		// Re-throw if it's already an H3Error
		if (error instanceof Error && error.name === "H3Error") {
			throw error;
		}
		
		const prismaError = handlePrismaError(error);
		throw createError({
			statusCode: prismaError.status,
			statusMessage: prismaError.message,
		});
	}
});