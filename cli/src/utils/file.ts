import {
	existsSync,
	mkdirSync,
	readFileSync,
	realpathSync,
	symlinkSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import type { ConfigManager } from "../config";
import type { PulledRule, Rule } from "../types";

export class FileManager {
	private config: ConfigManager;

	constructor(config: ConfigManager) {
		this.config = config;
		// Debug log for CI
		if (process.env.CI || process.env.GITHUB_ACTIONS) {
			console.log("FileManager initialized with config:", {
				rulesDir: config.getRulesDir(),
				symlinkDir: config.getSymlinkDir(),
			});
		}
	}

	private parseRuleName(fullName: string): {
		name: string;
		owner?: string;
		organization?: string;
	} {
		const parts = fullName.split("/");
		if (parts.length === 2 && parts[0].startsWith("@")) {
			// @username/rulename or @org/rulename
			const username = parts[0].substring(1);
			return {
				owner: username,
				name: parts[1],
			};
		}
		// rulename only (legacy)
		return {
			name: fullName,
		};
	}

	private getRulePath(rule: PulledRule): string {
		const parsed = this.parseRuleName(rule.name);
		const parts = [this.config.getRulesDir()];

		const organization = parsed.organization;
		const owner = parsed.owner;
		const name = parsed.name;

		if (organization) {
			parts.push(`@${organization}`);
		} else if (owner) {
			parts.push(`@${owner}`);
		}
		parts.push(`${name}.md`);
		return join(...parts);
	}

	private getSymlinkPath(rule: PulledRule): string {
		const parsed = this.parseRuleName(rule.name);
		const parts = [this.config.getSymlinkDir()];

		const organization = parsed.organization;
		const owner = parsed.owner;
		const name = parsed.name;

		if (organization) {
			parts.push(`@${organization}`);
		} else if (owner) {
			parts.push(`@${owner}`);
		}
		parts.push(`${name}.md`);
		return join(...parts);
	}

	public saveRule(rule: Rule, content: string): PulledRule {
		// Debug log for CI
		if (process.env.CI || process.env.GITHUB_ACTIONS) {
			console.log("saveRule called with:", {
				name: rule.name,
				organization: rule.organization,
				owner: rule.owner,
				user: rule.user,
			});
		}

		// フルパス形式の名前を構築（@プレフィックス付き、ただし組織やユーザーがある場合のみ）
		let fullName = rule.name;
		// Check for actual values, not just property existence
		if (
			rule.organization &&
			typeof rule.organization === "string" &&
			rule.organization.length > 0 &&
			rule.organization !== "undefined"
		) {
			fullName = `@${rule.organization}/${rule.name}`;
		} else if (
			rule.user?.username &&
			typeof rule.user.username === "string" &&
			rule.user.username.length > 0 &&
			rule.user.username !== "undefined"
		) {
			fullName = `@${rule.user.username}/${rule.name}`;
		} else if (
			rule.owner &&
			typeof rule.owner === "string" &&
			rule.owner.length > 0 &&
			rule.owner !== "undefined"
		) {
			// 後方互換性のため
			fullName = `@${rule.owner}/${rule.name}`;
		}
		// If no organization/owner/user, keep the name as is (no @undefined prefix)

		const pulledRule: PulledRule = {
			name: fullName,
			version: rule.version,
			pulledAt: new Date().toISOString(),
		};

		const rulePath = this.getRulePath(pulledRule);
		const ruleDir = dirname(rulePath);

		if (!existsSync(ruleDir)) {
			mkdirSync(ruleDir, { recursive: true });
		}

		writeFileSync(rulePath, content, "utf-8");

		// Try to create symlink, but don't fail if it doesn't work (e.g., in CI)
		try {
			this.createSymlink(pulledRule);
		} catch (error) {
			if (process.env.CI || process.env.GITHUB_ACTIONS) {
				console.warn("Symlink creation failed in CI, continuing without symlink:", error);
			} else {
				throw error;
			}
		}

		return pulledRule;
	}

	public createSymlink(rule: PulledRule): void {
		const rulePath = this.getRulePath(rule);
		const symlinkPath = this.getSymlinkPath(rule);
		const symlinkDir = dirname(symlinkPath);

		if (!existsSync(symlinkDir)) {
			mkdirSync(symlinkDir, { recursive: true });
		}

		if (existsSync(symlinkPath)) {
			unlinkSync(symlinkPath);
		}

		// Resolve real paths to handle potential symlinks in the path
		let relativePath: string;
		try {
			const realRulePath = realpathSync(rulePath);
			const realSymlinkDir = realpathSync(symlinkDir);
			relativePath = relative(realSymlinkDir, realRulePath);
		} catch (err) {
			// If realpath fails, fall back to original paths
			relativePath = relative(symlinkDir, rulePath);
		}

		try {
			// Try to create the symlink
			symlinkSync(relativePath, symlinkPath, "file");
		} catch (error) {
			const errorCode =
				error instanceof Error && "code" in error
					? (error as NodeJS.ErrnoException).code
					: undefined;

			// Log detailed error information
			console.error("Failed to create symlink:", {
				from: relativePath,
				to: symlinkPath,
				rulePath,
				symlinkDir,
				relativePath,
				rulePathExists: existsSync(rulePath),
				symlinkDirExists: existsSync(symlinkDir),
				error: error instanceof Error ? error.message : error,
				errorCode,
				platform: process.platform,
				isCI: process.env.CI || process.env.GITHUB_ACTIONS,
			});

			// Re-throw to maintain expected behavior
			throw error;
		}
	}

	public removeSymlink(rule: PulledRule): void {
		const symlinkPath = this.getSymlinkPath(rule);
		if (existsSync(symlinkPath)) {
			unlinkSync(symlinkPath);
		}
	}

	public readLocalRule(
		nameOrFullPath: string,
		owner?: string,
		organization?: string,
	): string | null {
		// フルパス形式の名前を構築（すべて@プレフィックス付き）
		let fullName = nameOrFullPath;

		// If name already contains @, use it as is
		if (!nameOrFullPath.includes("@")) {
			if (organization) {
				fullName = `@${organization}/${nameOrFullPath}`;
			} else if (owner) {
				fullName = `@${owner}/${nameOrFullPath}`;
			}
		}

		const rule: PulledRule = {
			name: fullName,
			version: "",
			pulledAt: "",
		};

		const rulePath = this.getRulePath(rule);
		if (existsSync(rulePath)) {
			return readFileSync(rulePath, "utf-8");
		}
		return null;
	}

	public updateLocalRule(rule: PulledRule, content: string): void {
		const rulePath = this.getRulePath(rule);
		writeFileSync(rulePath, content, "utf-8");
	}

	public ruleExists(rule: PulledRule): boolean {
		const rulePath = this.getRulePath(rule);
		return existsSync(rulePath);
	}
}
