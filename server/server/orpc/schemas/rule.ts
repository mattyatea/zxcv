import * as z from "zod";

// Base rule schema with contentType
export const RuleBaseSchema = z.object({
	id: z.string(),
	name: z.string(),
	userId: z.string().nullable(),
	type: z.enum(["rule", "ccsubagents"]).default("rule"),
	visibility: z.string(),
	description: z.string().nullable(),
	tags: z.array(z.string()),
	createdAt: z.number(),
	updatedAt: z.number(),
	publishedAt: z.number().nullable(),
	version: z.string(),
	latestVersionId: z.string().nullable(),
	views: z.number(),
	stars: z.number(),
	organizationId: z.string().nullable(),
});

// Rule with relations
export const RuleWithRelationsSchema = RuleBaseSchema.extend({
	user: z.object({
		id: z.string(),
		username: z.string(),
		email: z.string(),
	}),
	organization: z
		.object({
			id: z.string(),
			name: z.string(),
			displayName: z.string(),
		})
		.nullable(),
	author: z.object({
		id: z.string(),
		username: z.string(),
		email: z.string().optional(),
	}),
});

// Rule summary for list views
export const RuleSummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	author: z.object({
		id: z.string(),
		username: z.string(),
	}),
	visibility: z.string(),
	tags: z.array(z.string()),
	version: z.string(),
	updated_at: z.number(),
});
