import type { R2Bucket } from "@cloudflare/workers-types";
import { ORPCError } from "@orpc/server";
import type { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { OrganizationRepository } from "../repositories/OrganizationRepository";
import { RuleRepository } from "../repositories/RuleRepository";
import type { CloudflareEnv } from "../types/env";

export class RuleService {
	private ruleRepository: RuleRepository;
	private organizationRepository: OrganizationRepository;

	constructor(
		db: PrismaClient,
		private r2: R2Bucket,
		_env: CloudflareEnv,
	) {
		this.ruleRepository = new RuleRepository(db);
		this.organizationRepository = new OrganizationRepository(db);
	}

	/**
	 * ルールを作成
	 */
	async createRule(
		userId: string,
		data: {
			name: string;
			description?: string;
			content: string;
			visibility: "public" | "private" | "team";
			tags?: string[];
			organizationId?: string;
		},
	) {
		// 組織チェック
		if (data.organizationId) {
			const isMember = await this.organizationRepository.isMember(data.organizationId, userId);
			if (!isMember) {
				throw new ORPCError("FORBIDDEN", {
					message: "この組織にルールを作成する権限がありません",
				});
			}
		}

		// 名前の重複チェック
		const existingRule = await this.ruleRepository.findByName(data.name, data.organizationId);
		if (existingRule) {
			throw new ORPCError("CONFLICT", {
				message: "このルール名は既に使用されています",
			});
		}

		// ルール作成
		const ruleId = nanoid();
		const rule = await this.ruleRepository.create({
			id: ruleId,
			name: data.name,
			description: data.description || null,
			visibility: data.visibility,
			tags: data.tags ? JSON.stringify(data.tags) : null,
			publishedAt: null,
			downloads: 0,
			stars: 0,
			user: { connect: { id: userId } },
			...(data.organizationId ? { organization: { connect: { id: data.organizationId } } } : {}),
		});

		// 初期バージョンを作成
		const version = await this.ruleRepository.createVersion({
			id: nanoid(),
			rule: { connect: { id: ruleId } },
			versionNumber: "1.0.0",
			contentHash: await this.hashContent(data.content),
			changelog: "Initial version",
			r2ObjectKey: `rules/${ruleId}/1.0.0`,
			creator: { connect: { id: userId } },
		});

		// R2にコンテンツを保存
		await this.saveContentToR2(ruleId, version.versionNumber, data.content);

		return {
			rule,
			version,
		};
	}

	/**
	 * ルールを取得
	 */
	async getRule(nameOrId: string, orgName?: string, userId?: string) {
		let rule: any | null = null;

		if (orgName) {
			// 組織スコープのルール
			const org = await this.organizationRepository.findByName(orgName);
			if (!org) {
				throw new ORPCError("NOT_FOUND", {
					message: "組織が見つかりません",
				});
			}
			rule = await this.ruleRepository.findByName(nameOrId, org.id);
		} else {
			// IDまたは名前で検索
			rule = await this.ruleRepository.findById(nameOrId, true);
			if (!rule) {
				rule = await this.ruleRepository.findByName(nameOrId);
			}
		}

		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールが見つかりません",
			});
		}

		// アクセス権限チェック
		await this.checkRuleAccess(rule, userId);

		// 最新バージョンを取得
		const latestVersion = await this.ruleRepository.getLatestVersion(rule.id);
		if (!latestVersion) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールのバージョンが見つかりません",
			});
		}

		// コンテンツを取得
		const content = await this.getContentFromR2(rule.id, latestVersion.versionNumber);

		return {
			rule,
			version: latestVersion,
			content,
		};
	}

	/**
	 * ルールを更新
	 */
	async updateRule(
		ruleId: string,
		userId: string,
		data: {
			content?: string;
			description?: string;
			tags?: string[];
			changelog?: string;
		},
	) {
		const rule = await this.ruleRepository.findById(ruleId);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールが見つかりません",
			});
		}

		// 権限チェック
		if (rule.userId !== userId) {
			throw new ORPCError("FORBIDDEN", {
				message: "このルールを更新する権限がありません",
			});
		}

		// メタデータの更新
		if (data.description !== undefined || data.tags !== undefined) {
			await this.ruleRepository.update(ruleId, {
				description: data.description,
				tags: data.tags ? JSON.stringify(data.tags) : undefined,
			});
		}

		// コンテンツの更新（新しいバージョンを作成）
		if (data.content) {
			const latestVersion = await this.ruleRepository.getLatestVersion(ruleId);
			const currentVersionNumber = latestVersion?.versionNumber || "0.0.0";
			const newVersionNumber = this.incrementVersion(currentVersionNumber);

			const version = await this.ruleRepository.createVersion({
				id: nanoid(),
				rule: { connect: { id: ruleId } },
				versionNumber: newVersionNumber,
				contentHash: await this.hashContent(data.content),
				changelog: data.changelog || "Updated content",
				r2ObjectKey: `rules/${ruleId}/${newVersionNumber}`,
				creator: { connect: { id: userId } },
			});

			// R2にコンテンツを保存
			await this.saveContentToR2(ruleId, newVersionNumber, data.content);

			return {
				rule,
				version,
			};
		}

		return { rule };
	}

	/**
	 * ルールを公開
	 */
	async publishRule(ruleId: string, userId: string) {
		const rule = await this.ruleRepository.findById(ruleId);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールが見つかりません",
			});
		}

		if (rule.userId !== userId) {
			throw new ORPCError("FORBIDDEN", {
				message: "このルールを公開する権限がありません",
			});
		}

		if (rule.visibility === "private") {
			throw new ORPCError("BAD_REQUEST", {
				message: "プライベートルールは公開できません",
			});
		}

		await this.ruleRepository.update(ruleId, {
			publishedAt: this.getCurrentTimestamp(),
		});

		return { message: "ルールが公開されました" };
	}

	/**
	 * ルールを削除
	 */
	async deleteRule(ruleId: string, userId: string) {
		const rule = await this.ruleRepository.findById(ruleId);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールが見つかりません",
			});
		}

		// 権限チェック（作成者または組織オーナー）
		const canDelete = await this.canDeleteRule(rule, userId);
		if (!canDelete) {
			throw new ORPCError("FORBIDDEN", {
				message: "このルールを削除する権限がありません",
			});
		}

		// R2からコンテンツを削除
		await this.deleteRuleContents(ruleId);

		// データベースから削除
		await this.ruleRepository.delete(ruleId);

		return { message: "ルールが削除されました" };
	}

	/**
	 * ルールをプル（ダウンロード）
	 */
	async pullRule(ruleId: string, userId?: string) {
		const rule = await this.ruleRepository.findById(ruleId, true);
		if (!rule) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールが見つかりません",
			});
		}

		// アクセス権限チェック
		await this.checkRuleAccess(rule, userId);

		// ダウンロード数をインクリメント
		await this.ruleRepository.incrementDownloadCount(ruleId);

		// 最新バージョンのコンテンツを取得
		const latestVersion = await this.ruleRepository.getLatestVersion(ruleId);
		if (!latestVersion) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールのバージョンが見つかりません",
			});
		}

		const content = await this.getContentFromR2(ruleId, latestVersion.versionNumber);

		return {
			name: rule.name,
			description: rule.description,
			content,
			version: latestVersion.versionNumber,
			tags: rule.tags ? JSON.parse(rule.tags) : [],
			organization: rule.organization?.name,
			creator: rule.user?.username,
		};
	}

	/**
	 * 公開ルールを検索
	 */
	async searchPublicRules(params: { query?: string; page?: number; pageSize?: number }) {
		return await this.ruleRepository.findPublicRules(params.page, params.pageSize, params.query);
	}

	/**
	 * ユーザーのルールを取得
	 */
	async getUserRules(userId: string, page?: number, pageSize?: number) {
		return await this.ruleRepository.findByCreatorId(userId, page, pageSize);
	}

	/**
	 * ルールへのアクセス権限をチェック
	 */
	private async checkRuleAccess(rule: any, userId?: string) {
		// 公開されたパブリックルールは誰でもアクセス可能
		if (rule.publishedAt && rule.visibility === "public") {
			return;
		}

		// 未認証ユーザーはここで拒否
		if (!userId) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "このルールにアクセスするには認証が必要です",
			});
		}

		// 作成者は常にアクセス可能
		if (rule.userId === userId) {
			return;
		}

		// プライベートルールは作成者のみ
		if (rule.visibility === "private") {
			throw new ORPCError("FORBIDDEN", {
				message: "このルールにアクセスする権限がありません",
			});
		}

		// チームルールは組織メンバーのみ
		if (rule.visibility === "team" && rule.organizationId) {
			const isMember = await this.organizationRepository.isMember(rule.organizationId, userId);
			if (!isMember) {
				throw new ORPCError("FORBIDDEN", {
					message: "このルールにアクセスする権限がありません",
				});
			}
		}
	}

	/**
	 * ルール削除権限をチェック
	 */
	private async canDeleteRule(rule: any, userId: string): Promise<boolean> {
		// 作成者は削除可能
		if (rule.userId === userId) {
			return true;
		}

		// 組織オーナーも削除可能
		if (rule.organizationId) {
			return await this.organizationRepository.isOwner(rule.organizationId, userId);
		}

		return false;
	}

	/**
	 * コンテンツのハッシュを生成
	 */
	private async hashContent(content: string): Promise<string> {
		const encoder = new TextEncoder();
		const data = encoder.encode(content);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	}

	/**
	 * R2にコンテンツを保存
	 */
	private async saveContentToR2(ruleId: string, version: string, content: string) {
		const key = `rules/${ruleId}/versions/${version}/content.md`;
		await this.r2.put(key, content);
	}

	/**
	 * R2からコンテンツを取得
	 */
	private async getContentFromR2(ruleId: string, version: string): Promise<string> {
		const key = `rules/${ruleId}/versions/${version}/content.md`;
		const object = await this.r2.get(key);

		if (!object) {
			throw new ORPCError("NOT_FOUND", {
				message: "ルールのコンテンツが見つかりません",
			});
		}

		return await object.text();
	}

	/**
	 * R2からルールの全コンテンツを削除
	 */
	private async deleteRuleContents(ruleId: string) {
		const prefix = `rules/${ruleId}/`;
		const objects = await this.r2.list({ prefix });

		const deletePromises = objects.objects.map((obj) => this.r2.delete(obj.key));
		await Promise.all(deletePromises);
	}

	/**
	 * 現在のタイムスタンプを取得（Unix秒）
	 */
	private getCurrentTimestamp(): number {
		return Math.floor(Date.now() / 1000);
	}

	/**
	 * バージョン番号をインクリメント
	 */
	private incrementVersion(version: string): string {
		const parts = version.split(".");
		const patch = Number.parseInt(parts[2] || "0", 10) + 1;
		return `${parts[0]}.${parts[1]}.${patch}`;
	}
}
