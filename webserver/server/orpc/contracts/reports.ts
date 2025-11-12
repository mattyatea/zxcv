import { oc } from "@orpc/contract";
import * as z from "zod";
import { SuccessResponseSchema } from "../schemas/common";

export const ReportReasonSchema = z.enum(["spam", "inappropriate", "copyright", "other"]);

export const ReportStatusSchema = z.enum(["pending", "reviewing", "resolved", "rejected"]);

export const ReportSchema = z.object({
	id: z.string(),
	ruleId: z.string(),
	reporterId: z.string(), // Required - anonymous reports not allowed
	reason: ReportReasonSchema,
	description: z.string().nullable(),
	status: ReportStatusSchema,
	reviewedBy: z.string().nullable(),
	reviewNote: z.string().nullable(),
	createdAt: z.number(),
	updatedAt: z.number(),
	resolvedAt: z.number().nullable(),
});

export const ReportWithRelationsSchema = ReportSchema.extend({
	rule: z.object({
		id: z.string(),
		name: z.string(),
		visibility: z.enum(["public", "private", "organization"]),
		user: z.object({
			id: z.string(),
			username: z.string(),
		}),
		organization: z
			.object({
				id: z.string(),
				name: z.string(),
				displayName: z.string(),
			})
			.nullable(),
	}),
	reporter: z.object({
		id: z.string(),
		username: z.string(),
		email: z.string(),
	}),
	reviewer: z
		.object({
			id: z.string(),
			username: z.string(),
		})
		.nullable(),
});

export const reportsContract = {
	create: oc
		.route({
			method: "POST",
			path: "/reports/create",
			description:
				"Create a new report for a rule (requires authentication, reporter is automatically set from auth context)",
		})
		.input(
			z.object({
				ruleId: z.string().describe("ID of the rule to report"),
				reason: ReportReasonSchema.describe("Reason for the report"),
				description: z.string().optional().describe("Additional details"),
			}),
		)
		.output(
			z.object({
				id: z.string(),
			}),
		),

	list: oc
		.route({
			method: "POST",
			path: "/reports/list",
			description: "List reports (admin only)",
		})
		.input(
			z.object({
				status: ReportStatusSchema.optional(),
				ruleId: z.string().optional(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.output(
			z.object({
				reports: z.array(ReportWithRelationsSchema),
				total: z.number(),
				limit: z.number(),
				offset: z.number(),
			}),
		),

	get: oc
		.route({
			method: "POST",
			path: "/reports/get",
			description: "Get a specific report (admin only)",
		})
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.output(ReportWithRelationsSchema),

	updateStatus: oc
		.route({
			method: "POST",
			path: "/reports/updateStatus",
			description: "Update report status (admin only)",
		})
		.input(
			z.object({
				id: z.string(),
				status: ReportStatusSchema,
				reviewNote: z.string().optional(),
			}),
		)
		.output(SuccessResponseSchema),

	stats: oc
		.route({
			method: "POST",
			path: "/reports/stats",
			description: "Get report statistics (admin only)",
		})
		.input(z.object({}))
		.output(
			z.object({
				total: z.number(),
				pending: z.number(),
				reviewing: z.number(),
				resolved: z.number(),
				rejected: z.number(),
			}),
		),
};
