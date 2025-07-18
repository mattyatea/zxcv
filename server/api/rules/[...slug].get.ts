import { z } from "zod";
import type { H3EventContext } from "~/server/types/bindings";
import { getAuthFromEvent } from "~/server/utils/auth";
import { createPrismaClient } from "~/server/utils/prisma";
import { canViewTeamRule } from "~/server/utils/teams";

const querySchema = z.object({
	version: z.string().optional(),
});

export default defineEventHandler(async (event) => {
	const context = event.context as H3EventContext;
	const env = context.cloudflare.env;
	
	// Parse the slug to extract org and rulename
	const slug = getRouterParam(event, "slug");
	if (!slug) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid route",
		});
	}
	
	const parts = slug.split("/");
	// Check if it's an organization rule pattern (@org/rulename)
	if (parts.length !== 2 || !parts[0].startsWith("@")) {
		throw createError({
			statusCode: 404,
			statusMessage: "Not found",
		});
	}
	
	const org = parts[0].substring(1); // Remove the @ prefix
	const rulename = parts[1];
	
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
	
	const { version } = validation.data;
	
	// Get auth context (optional)
	const auth = await getAuthFromEvent(event);
	const user = auth.user;
	
	const prisma = createPrismaClient(env.DB);
	
	try {
		// Find rule with author information
		const rule = await prisma.rule.findFirst({
			where: {
				name: rulename,
				org: org,
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
			// Check team membership
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
			versionData = await prisma.ruleVersion.findFirst({
				where: {
					ruleId: rule.id,
					versionNumber: version,
				},
			});
		} else if (rule.latestVersionId) {
			versionData = await prisma.ruleVersion.findUnique({
				where: {
					id: rule.latestVersionId,
				},
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
			organization: rule.org || "",
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
		
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to fetch rule",
		});
	}
});