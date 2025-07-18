import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { requireEmailVerification, getAuthFromEvent } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";
import { generateId } from "~/server/utils/crypto";
import { handlePrismaError } from "~/server/utils/prismaErrors";

const createRuleSchema = z.object({
	name: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-zA-Z0-9_-]+$/),
	org: z
		.string()
		.min(1)
		.max(50)
		.regex(/^[a-zA-Z0-9_-]+$/)
		.optional(),
	visibility: z.enum(["public", "private", "team"]).default("private"),
	description: z.string().max(500).optional(),
	tags: z.array(z.string()).optional(),
	content: z.string().min(1),
	teamId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Require authentication and email verification
	const user = await requireEmailVerification(event);
	
	// Check scope for API key authentication
	const auth = await getAuthFromEvent(event);
	if (auth.apiKeyScopes && !auth.apiKeyScopes.includes("rules:write")) {
		throw createError({
			statusCode: 403,
			statusMessage: "Insufficient scope",
		});
	}
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = createRuleSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const { name, org, visibility, description, tags, content, teamId } = validation.data;
	
	try {
		const prisma = createPrismaClient(env.DB);
		
		// Check if rule already exists
		const existing = await prisma.rule.findFirst({
			where: {
				name,
				org: org || null,
			},
		});
		
		if (existing) {
			throw createError({
				statusCode: 409,
				statusMessage: "Rule already exists",
			});
		}
		
		// Generate IDs
		const ruleId = generateId();
		const versionId = generateId();
		const now = Math.floor(Date.now() / 1000);
		
		// Calculate content hash
		const encoder = new TextEncoder();
		const contentData = encoder.encode(content);
		const hashBuffer = await crypto.subtle.digest("SHA-256", contentData);
		const contentHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
		
		// Store content in R2
		const r2Key = `rules/${ruleId}/versions/${versionId}.md`;
		await env.R2.put(r2Key, content, {
			customMetadata: {
				ruleId,
				versionId,
				userId: user.id,
				createdAt: now.toString(),
			},
		});
		
		// Check team membership if creating team rule
		if (visibility === "team" && teamId) {
			const teamMember = await prisma.teamMember.findFirst({
				where: {
					teamId,
					userId: user.id,
				},
			});
			
			if (!teamMember) {
				throw createError({
					statusCode: 403,
					statusMessage: "Not a member of the team",
				});
			}
		}
		
		// Create rule and version sequentially (D1 doesn't support transactions)
		const rule = await prisma.rule.create({
			data: {
				id: ruleId,
				name,
				org: org || null,
				userId: user.id,
				visibility,
				description: description || null,
				tags: tags ? JSON.stringify(tags) : null,
				createdAt: now,
				updatedAt: now,
				version: "1.0.0",
				latestVersionId: versionId,
				teamId: visibility === "team" ? teamId : null,
			},
		});
		
		try {
			// Create initial version
			await prisma.ruleVersion.create({
				data: {
					id: versionId,
					ruleId,
					versionNumber: "1.0.0",
					changelog: "Initial version",
					contentHash,
					r2ObjectKey: r2Key,
					createdAt: now,
					createdBy: user.id,
				},
			});
		} catch (error) {
			// Manual rollback: delete the rule if version creation fails
			await prisma.rule.delete({ where: { id: ruleId } });
			throw error;
		}
		
		setResponseStatus(event, 201);
		return {
			id: rule.id,
			name: rule.name,
			org: rule.org,
			visibility: rule.visibility,
			version: rule.version,
			created_at: rule.createdAt,
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