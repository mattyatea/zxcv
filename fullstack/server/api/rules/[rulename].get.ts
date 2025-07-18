import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { getAuthFromEvent } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";
import { canViewTeamRule } from "~/server/utils/teams";
import { handlePrismaError } from "~/server/utils/prismaErrors";

const querySchema = z.object({
	org: z.string().optional(),
	version: z.string().optional(),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Get route parameter
	const rulename = getRouterParam(event, "rulename");
	if (!rulename) {
		throw createError({
			statusCode: 400,
			statusMessage: "Rule name is required",
		});
	}
	
	// Parse and validate query parameters
	const query = getQuery(event);
	const validation = querySchema.safeParse(query);
	
	if (!validation.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid query parameters",
			data: validation.error.flatten(),
		});
	}
	
	const { org, version } = validation.data;
	
	// Get auth context (optional)
	const auth = await getAuthFromEvent(event);
	const user = auth.user;
	
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Find rule with author information
		const rule = await prisma.rule.findFirst({
			where: {
				name: rulename,
				org: org || null,
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		});
		
		if (!rule) {
			throw createError({
				statusCode: 404,
				statusMessage: "Rule not found",
			});
		}
		
		// Check access permissions
		if (rule.visibility === "private" && (!user || user.id !== rule.userId)) {
			throw createError({
				statusCode: 401,
				statusMessage: "Unauthorized",
			});
		}
		
		if (rule.visibility === "team") {
			if (!user || !rule.teamId) {
				throw createError({
					statusCode: 401,
					statusMessage: "Unauthorized",
				});
			}
			
			const canView = await canViewTeamRule(prisma, user.id, rule.teamId);
			if (!canView) {
				throw createError({
					statusCode: 401,
					statusMessage: "Unauthorized",
				});
			}
		}
		
		// Get specific version or latest
		let versionData: { id: string; versionNumber: string; r2ObjectKey: string } | null = null;
		if (version) {
			versionData = await prisma.ruleVersion.findUnique({
				where: {
					// biome-ignore lint/style/useNamingConvention: Prisma generated composite key
					ruleId_versionNumber: {
						ruleId: rule.id,
						versionNumber: version,
					},
				},
			});
		} else if (rule.latestVersionId) {
			versionData = await prisma.ruleVersion.findUnique({
				where: { id: rule.latestVersionId },
			});
		}
		
		if (!versionData) {
			throw createError({
				statusCode: 404,
				statusMessage: "Version not found",
			});
		}
		
		// Get content from R2
		const object = await env.R2.get(versionData.r2ObjectKey);
		if (!object) {
			throw createError({
				statusCode: 404,
				statusMessage: "Content not found",
			});
		}
		
		const content = await object.text();
		
		return {
			id: rule.id,
			name: rule.name,
			org: rule.org || undefined,
			visibility: rule.visibility,
			description: rule.description || undefined,
			tags: rule.tags ? JSON.parse(rule.tags) : undefined,
			version: versionData.versionNumber,
			content,
			author: {
				id: rule.user.id,
				username: rule.user.username,
			},
			created_at: rule.createdAt,
			updated_at: rule.updatedAt,
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