import { ORPCError } from "@orpc/server";
import type {
	PrismaClient,
	Report,
	ReportReason,
	ReportStatus,
} from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export interface CreateReportInput {
	ruleId: string;
	reporterId: string; // Required - anonymous reports not allowed
	reason: ReportReason;
	description?: string | null;
}

export interface UpdateReportStatusInput {
	status: ReportStatus;
	reviewedBy: string;
	reviewNote?: string | null;
}

export interface ListReportsFilter {
	status?: ReportStatus;
	ruleId?: string;
	limit?: number;
	offset?: number;
}

export class ReportRepository extends BaseRepository {
	constructor(db: PrismaClient) {
		super(db);
	}

	/**
	 * Create a new report
	 */
	async create(data: CreateReportInput): Promise<Report> {
		try {
			const report = await this.db.report.create({
				data: {
					id: crypto.randomUUID(),
					ruleId: data.ruleId,
					reporterId: data.reporterId,
					reason: data.reason,
					description: data.description,
					status: "pending",
					createdAt: this.getCurrentTimestamp(),
					updatedAt: this.getCurrentTimestamp(),
				},
			});

			return report;
		} catch (error) {
			this.handleError(error, "通報の作成に失敗しました");
		}
	}

	/**
	 * Get a report by ID
	 */
	async findById(id: string): Promise<Report | null> {
		try {
			const report = await this.db.report.findUnique({
				where: { id },
			});

			return report;
		} catch (error) {
			this.handleError(error, "通報の取得に失敗しました");
		}
	}

	/**
	 * Get a report by ID with relations
	 */
	async findByIdWithRelations(id: string) {
		try {
			const report = await this.db.report.findUnique({
				where: { id },
				include: {
					rule: {
						include: {
							user: {
								select: {
									id: true,
									username: true,
								},
							},
							organization: {
								select: {
									id: true,
									name: true,
									displayName: true,
								},
							},
						},
					},
					reporter: {
						select: {
							id: true,
							username: true,
							email: true,
						},
					},
					reviewer: {
						select: {
							id: true,
							username: true,
						},
					},
				},
			});

			if (!report) {
				throw new ORPCError("NOT_FOUND", {
					message: "通報が見つかりません",
				});
			}

			return report;
		} catch (error) {
			this.handleError(error, "通報の取得に失敗しました");
		}
	}

	/**
	 * List reports with filters
	 */
	async list(filter: ListReportsFilter) {
		try {
			const where = {
				...(filter.status ? { status: filter.status } : {}),
				...(filter.ruleId ? { ruleId: filter.ruleId } : {}),
			};

			const [reports, total] = await Promise.all([
				this.db.report.findMany({
					where,
					include: {
						rule: {
							include: {
								user: {
									select: {
										id: true,
										username: true,
									},
								},
								organization: {
									select: {
										id: true,
										name: true,
										displayName: true,
									},
								},
							},
						},
						reporter: {
							select: {
								id: true,
								username: true,
								email: true,
							},
						},
						reviewer: {
							select: {
								id: true,
								username: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
					take: filter.limit || 20,
					skip: filter.offset || 0,
				}),
				this.db.report.count({ where }),
			]);

			return {
				reports,
				total,
			};
		} catch (error) {
			this.handleError(error, "通報の一覧取得に失敗しました");
		}
	}

	/**
	 * Update report status
	 */
	async updateStatus(
		id: string,
		data: UpdateReportStatusInput,
	): Promise<Report> {
		try {
			const report = await this.db.report.update({
				where: { id },
				data: {
					status: data.status,
					reviewedBy: data.reviewedBy,
					reviewNote: data.reviewNote,
					updatedAt: this.getCurrentTimestamp(),
					resolvedAt:
						data.status === "resolved" || data.status === "rejected"
							? this.getCurrentTimestamp()
							: null,
				},
			});

			return report;
		} catch (error) {
			this.handleError(error, "通報ステータスの更新に失敗しました");
		}
	}

	/**
	 * Get report statistics
	 */
	async getStats() {
		try {
			const [total, pending, reviewing, resolved, rejected] = await Promise.all(
				[
					this.db.report.count(),
					this.db.report.count({ where: { status: "pending" } }),
					this.db.report.count({ where: { status: "reviewing" } }),
					this.db.report.count({ where: { status: "resolved" } }),
					this.db.report.count({ where: { status: "rejected" } }),
				],
			);

			return {
				total,
				pending,
				reviewing,
				resolved,
				rejected,
			};
		} catch (error) {
			this.handleError(error, "統計情報の取得に失敗しました");
		}
	}

	/**
	 * Check if a user has already reported a rule
	 */
	async hasUserReportedRule(ruleId: string, userId: string): Promise<boolean> {
		try {
			const existingReport = await this.db.report.findFirst({
				where: {
					ruleId,
					reporterId: userId,
					status: {
						in: ["pending", "reviewing"],
					},
				},
			});

			return !!existingReport;
		} catch (error) {
			this.handleError(error, "通報チェックに失敗しました");
		}
	}
}
