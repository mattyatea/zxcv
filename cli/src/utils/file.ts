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

	private getRulePath(rule: PulledRule): string {
		const parts = [this.config.getRulesDir()];
		if (rule.organization) {
			parts.push(`@${rule.organization}`);
		} else if (rule.owner) {
			parts.push(rule.owner);
		}
		parts.push(`${rule.name}.md`);
		return join(...parts);
	}

	private getSymlinkPath(rule: PulledRule): string {
		const parts = [this.config.getSymlinkDir()];
		if (rule.organization) {
			parts.push(`@${rule.organization}`);
		} else if (rule.owner) {
			parts.push(rule.owner);
		}
		parts.push(`${rule.name}.md`);
		return join(...parts);
	}

	public saveRule(rule: Rule, content: string): PulledRule {
		const pulledRule: PulledRule = {
			name: rule.name,
			path: rule.id,
			owner: rule.owner,
			organization: rule.organization,
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

	public readLocalRule(name: string, owner?: string, organization?: string): string | null {
		const rule: PulledRule = {
			name,
			path: "",
			owner,
			organization,
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
