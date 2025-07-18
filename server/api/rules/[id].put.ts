import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { requireEmailVerification, getAuthFromEvent } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";
import { generateId } from "~/server/utils/crypto";
import { handlePrismaError } from "~/server/utils/prismaErrors";
import { canEditTeamRule } from "~/server/utils/teams";

const updateRuleSchema = z.object({
	description: z.string().max(500).optional(),
	tags: z.array(z.string()).optional(),
	content: z.string().optional(),
	version: z
		.string()
		.regex(/^\d+\.\d+\.\d+$/)
		.optional(),
	changelog: z.string().optional(),
});

function incrementVersion(version: string): string {
	const parts = version.split(".").map(Number);
	parts[2]++; // Increment patch version
	return parts.join(".");
}

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
	
	// Get route parameter
	const id = getRouterParam(event, "id");
	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: "Rule ID is required",
		});
	}
	
	// Parse and validate request body
	const body = await readBody(event);
	const validation = updateRuleSchema.safeParse(body);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid request data",
			data: validation.error.flatten(),
		});
	}
	
	const { description, tags, content, version, changelog } = validation.data;
	
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Find rule and check ownership
		const rule = await prisma.rule.findUnique({
			where: { id },
		});
		
		if (!rule) {
			throw createError({
				statusCode: 404,
				statusMessage: "Rule not found",
			});
		}
		
		// Check permissions based on ownership or team membership
		if (rule.userId !== user.id) {
			// If not the owner, check if they have team edit permissions
			if (rule.teamId && rule.visibility === "team") {
				const canEdit = await canEditTeamRule(prisma, user.id, rule.teamId);
				if (!canEdit) {
					throw createError({
						statusCode: 401,
						statusMessage: "Unauthorized",
					});
				}
			} else {
				throw createError({
					statusCode: 401,
					statusMessage: "Unauthorized",
				});
			}
		}
		
		const now = Math.floor(Date.now() / 1000);
		
		// Prepare update data
		const updateData: Record<string, string | number | null> = {
			updatedAt: now,
		};
		
		// Update metadata
		if (description !== undefined) {
			updateData.description = description || null;
		}
		
		if (tags !== undefined) {
			updateData.tags = JSON.stringify(tags);
		}
		
		// Prepare batch operations
		const operations = [];
		
		// Create new version if content changed
		let newVersion = rule.version;
		if (content) {
			const versionId = generateId();
			newVersion = version || incrementVersion(rule.version);
			
			// Calculate content hash
			const encoder = new TextEncoder();
			const contentData = encoder.encode(content);
			const hashBuffer = await crypto.subtle.digest("SHA-256", contentData);
			const contentHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
			
			// Store content in R2
			const r2Key = `rules/${rule.id}/versions/${versionId}.md`;
			await env.R2.put(r2Key, content, {
				customMetadata: {
					ruleId: rule.id,
					versionId,
					userId: user.id,
					createdAt: now.toString(),
				},
			});
			
			// Add new version creation to operations
			operations.push(
				prisma.ruleVersion.create({
					data: {
						id: versionId,
						ruleId: rule.id,
						versionNumber: newVersion,
						changelog: changelog || `Updated to version ${newVersion}`,
						contentHash,
						r2ObjectKey: r2Key,
						createdAt: now,
						createdBy: user.id,
					},
				}),
			);
			
			updateData.version = newVersion;
			updateData.latestVersionId = versionId;
		}
		
		// Add rule update to operations
		operations.push(
			prisma.rule.update({
				where: { id },
				data: updateData,
			}),
		);
		
		// Execute operations sequentially (D1 doesn't support transactions)
		// First, create new version if needed
		if (operations.length > 1) {
			try {
				// Create new version first
				await operations[0];
			} catch (error) {
				// If version creation fails, we need to clean up the R2 object
				if (content) {
					const r2Key = `rules/${rule.id}/versions/${generateId()}.md`;
					await env.R2.delete(r2Key);
				}
				throw error;
			}
		}
		
		// Then update the rule
		const updatedRule = await prisma.rule.update({
			where: { id },
			data: updateData,
		});
		
		return {
			id: updatedRule.id,
			version: updatedRule.version,
			description: updatedRule.description,
			tags: updatedRule.tags ? JSON.parse(updatedRule.tags) : undefined,
			updated_at: updatedRule.updatedAt,
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