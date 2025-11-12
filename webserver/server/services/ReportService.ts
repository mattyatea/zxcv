import { ORPCError } from "@orpc/server";
import type { PrismaClient, ReportReason, ReportStatus } from "@prisma/client";
import {
	type ListReportsFilter,
	ReportRepository,
	RuleRepository,
	type UpdateReportStatusInput,
	UserRepository,
} from "../repositories";
import type { CloudflareEnv } from "../types/env";
import { createLogger } from "../utils/logger";

export class ReportService {
	private reportRepository: ReportRepository;
	private ruleRepository: RuleRepository;
	private userRepository: UserRepository;
	private logger;

	constructor(db: PrismaClient, env: CloudflareEnv) {
		this.reportRepository = new ReportRepository(db);
		this.ruleRepository = new RuleRepository(db);
		this.userRepository = new UserRepository(db);
		this.logger = createLogger(env);
	}

	/**
	 * Create a new report
	 * Requires authentication - anonymous reports not allowed
	 */
	async createReport(params: {
		ruleId: string;
		reporterId: string; // Required - anonymous reports not allowed
		reason: ReportReason;
		description?: string;
	}) {
		// Check if the rule exists
		const rule = await this.ruleRepository.findById(params.ruleId);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "通報対象のルールが見つかりません",
			});
		}

		// Check if user has already reported this rule
		const hasReported = await this.reportRepository.hasUserReportedRule(
			params.ruleId,
			params.reporterId,
		);

		if (hasReported) {
			throw new ORPCError("CONFLICT", {
				message: "このルールは既に通報済みです",
			});
		}

		// Create the report
		const report = await this.reportRepository.create({
			ruleId: params.ruleId,
			reporterId: params.reporterId,
			reason: params.reason,
			description: params.description,
		});

		this.logger.info("Report created", {
			reportId: report.id,
			ruleId: params.ruleId,
			reporterId: params.reporterId,
			reason: params.reason,
		});

		return report;
	}

	/**
	 * List reports (admin only)
	 */
	async listReports(params: {
		status?: ReportStatus;
		ruleId?: string;
		limit?: number;
		offset?: number;
		userId: string;
	}) {
		// Check admin permission
		await this.checkAdminPermission(params.userId);

		const filter: ListReportsFilter = {
			status: params.status,
			ruleId: params.ruleId,
			limit: params.limit,
			offset: params.offset,
		};

		const result = await this.reportRepository.list(filter);

		return {
			reports: result.reports,
			total: result.total,
		};
	}

	/**
	 * Get a specific report (admin only)
	 */
	async getReport(reportId: string, userId: string) {
		// Check admin permission
		await this.checkAdminPermission(userId);

		const report = await this.reportRepository.findByIdWithRelations(reportId);

		return report;
	}

	/**
	 * Update report status (admin only)
	 */
	async updateReportStatus(params: {
		reportId: string;
		status: ReportStatus;
		reviewNote?: string;
		userId: string;
	}) {
		// Check admin permission
		await this.checkAdminPermission(params.userId);

		// Check if report exists
		const report = await this.reportRepository.findById(params.reportId);
		if (!report) {
			throw new ORPCError("NOT_FOUND", {
				message: "通報が見つかりません",
			});
		}

		// Update the report
		const updateData: UpdateReportStatusInput = {
			status: params.status,
			reviewedBy: params.userId,
			reviewNote: params.reviewNote,
		};

		await this.reportRepository.updateStatus(params.reportId, updateData);

		this.logger.info("Report status updated", {
			reportId: params.reportId,
			status: params.status,
			reviewedBy: params.userId,
		});

		return { success: true, message: "通報ステータスを更新しました" };
	}

	/**
	 * Get report statistics (admin only)
	 */
	async getStats(userId: string) {
		// Check admin permission
		await this.checkAdminPermission(userId);

		const stats = await this.reportRepository.getStats();

		return stats;
	}

	/**
	 * Check if user has admin permission
	 */
	private async checkAdminPermission(userId: string) {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "ユーザーが見つかりません",
			});
		}

		if (user.role !== "admin" && user.role !== "moderator") {
			throw new ORPCError("FORBIDDEN", {
				message: "この操作を実行する権限がありません",
			});
		}
	}
}
