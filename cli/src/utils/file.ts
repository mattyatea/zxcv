import {
	existsSync,
	mkdirSync,
	readFileSync,
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
	}

	private parseRuleName(fullName: string): {
		name: string;
		owner?: string;
		organization?: string;
	} {
		const parts = fullName.split("/");
		if (parts.length === 2 && parts[0].startsWith("@")) {
			// @org/rulename
			return {
				organization: parts[0].substring(1),
				name: parts[1],
			};
		}
		if (parts.length === 2) {
			// username/rulename
			return {
				owner: parts[0],
				name: parts[1],
			};
		}
		// rulename only
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
			parts.push(owner);
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
			parts.push(owner);
		}
		parts.push(`${name}.md`);
		return join(...parts);
	}

	public saveRule(rule: Rule, content: string): PulledRule {
		// フルパス形式の名前を構築
		let fullName = rule.name;
		if (rule.organization) {
			fullName = `@${rule.organization}/${rule.name}`;
		} else if (rule.owner) {
			fullName = `${rule.owner}/${rule.name}`;
		}

		const pulledRule: PulledRule = {
			name: fullName,
			path: rule.id,
			version: rule.version,
			pulledAt: new Date().toISOString(),
		};

		const rulePath = this.getRulePath(pulledRule);
		const ruleDir = dirname(rulePath);

		if (!existsSync(ruleDir)) {
			mkdirSync(ruleDir, { recursive: true });
		}

		writeFileSync(rulePath, content, "utf-8");
		this.createSymlink(pulledRule);

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

		const relativePath = relative(symlinkDir, rulePath);
		symlinkSync(relativePath, symlinkPath);
	}

	public removeSymlink(rule: PulledRule): void {
		const symlinkPath = this.getSymlinkPath(rule);
		if (existsSync(symlinkPath)) {
			unlinkSync(symlinkPath);
		}
	}

	public readLocalRule(
		name: string,
		owner?: string,
		organization?: string,
	): string | null {
		// フルパス形式の名前を構築
		let fullName = name;
		if (organization) {
			fullName = `@${organization}/${name}`;
		} else if (owner) {
			fullName = `${owner}/${name}`;
		}

		const rule: PulledRule = {
			name: fullName,
			path: "",
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
