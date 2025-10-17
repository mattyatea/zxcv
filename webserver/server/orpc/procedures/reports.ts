import { ReportService } from "../../services";
import { os } from "../index";
import { authRequiredMiddleware } from "../middleware/auth";
import { dbProvider } from "../middleware/db";
import { reportRateLimit } from "../middleware/rateLimit";

export const reportsProcedures = {
	/**
	 * Create a new report
	 * Requires authentication - anonymous reports are not allowed
	 * Rate limited to prevent abuse (10 reports per hour per user)
	 */
	create: os.reports.create
		.use(reportRateLimit) // Apply rate limit first
		.use(dbProvider)
		.use(authRequiredMiddleware) // Then check authentication
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const reportService = new ReportService(db, env);

			const report = await reportService.createReport({
				ruleId: input.ruleId,
				reporterId: user.id, // Now guaranteed to exist due to dbWithAuth
				reason: input.reason,
				description: input.description,
			});

			return { id: report.id };
		}),

	/**
	 * List reports (admin only)
	 */
	list: os.reports.list
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const reportService = new ReportService(db, env);

			const result = await reportService.listReports({
				status: input.status,
				ruleId: input.ruleId,
				limit: input.limit,
				offset: input.offset,
				userId: user.id,
			});

			return {
				reports: result.reports.map((report) => ({
					...report,
					rule: {
						...report.rule,
						visibility: report.rule.visibility as "public" | "private" | "organization",
					},
				})),
				total: result.total,
				limit: input.limit,
				offset: input.offset,
			};
		}),

	/**
	 * Get a specific report (admin only)
	 */
	get: os.reports.get
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const reportService = new ReportService(db, env);

			const report = await reportService.getReport(input.id, user.id);

			return {
				...report,
				rule: {
					...report.rule,
					visibility: report.rule.visibility as "public" | "private" | "organization",
				},
			};
		}),

	/**
	 * Update report status (admin only)
	 */
	updateStatus: os.reports.updateStatus
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ input, context }) => {
			const { db, user, env } = context;
			const reportService = new ReportService(db, env);

			return await reportService.updateReportStatus({
				reportId: input.id,
				status: input.status,
				reviewNote: input.reviewNote,
				userId: user.id,
			});
		}),

	/**
	 * Get report statistics (admin only)
	 */
	stats: os.reports.stats
		.use(dbProvider)
		.use(authRequiredMiddleware)
		.handler(async ({ context }) => {
			const { db, user, env } = context;
			const reportService = new ReportService(db, env);

			return await reportService.getStats(user.id);
		}),
};
