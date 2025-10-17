import {
	appendFileSync,
	existsSync,
	lstatSync,
	mkdirSync,
	readFileSync,
	symlinkSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative } from "node:path";
import type { ConfigManager } from "../config";
import type { PulledRule } from "../types";

export class MemoryFileManager {
	private readonly KNOWN_FILES = [
		"Agents.md",
		"CLAUDE.md",
		"CLAUDE.local.md",
		"COPILOT.md",
		".github/copilot-instructions.md",
		"CURSOR.md",
		".cursorrules",
		"CODEIUM.md",
		"AI.md",
	];

	private config: ConfigManager;

	constructor(config: ConfigManager) {
		this.config = config;
	}

	// ファイルパスを解決（~展開など）
	public resolveFilePath(path: string): string {
		if (path.startsWith("~")) {
			return path.replace("~", homedir());
		}
		if (isAbsolute(path)) {
			return path;
		}
		return join(process.cwd(), path);
	}

	// 表示用パスを取得
	public getDisplayPath(filePath: string): string {
		const cwd = process.cwd();
		const home = homedir();

		if (filePath.startsWith(cwd)) {
			return relative(cwd, filePath) || ".";
		}
		if (filePath.startsWith(home)) {
			return `~${filePath.slice(home.length)}`;
		}
		return filePath;
	}

	// メモリファイルを検索
	public findMemoryFiles(scope: "project" | "user" | "all"): string[] {
		const files: string[] = [];

		if (scope === "project" || scope === "all") {
			const projectDir = process.cwd();
			for (const fileName of this.KNOWN_FILES) {
				const filePath = join(projectDir, fileName);
				if (existsSync(filePath)) {
					files.push(filePath);
				}
			}
		}

		if (scope === "user" || scope === "all") {
			const userDir = homedir();
			for (const fileName of this.KNOWN_FILES) {
				const filePath = join(userDir, fileName);
				if (existsSync(filePath)) {
					files.push(filePath);
				}
			}
		}

		return files;
	}

	// ルールをメモリファイルに追加
	public async addRule(filePath: string, rule: PulledRule): Promise<void> {
		const rulePath = this.getRulePath(rule);
		const homeDir = homedir();
		const displayPath = rulePath.replace(homeDir, "~");

		const entry = `\n## ${rule.name}\n@${displayPath}\n`;

		if (!existsSync(filePath)) {
			// ファイルを新規作成
			const header = this.getFileHeader(basename(filePath));
			mkdirSync(dirname(filePath), { recursive: true });
			writeFileSync(filePath, header + entry);
		} else {
			// 既存ファイルに追記
			const content = readFileSync(filePath, "utf-8");
			// 正規表現を使用して厳密にヘッダーをチェック
			const escapedRuleName = rule.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const existingRuleRegex = new RegExp(`^## ${escapedRuleName}$`, "m");
			if (!existingRuleRegex.test(content)) {
				appendFileSync(filePath, entry);
			}
		}
	}

	// ルールをメモリファイルから削除
	public async removeRule(filePath: string, ruleName: string): Promise<void> {
		if (!existsSync(filePath)) {
			return;
		}

		const content = readFileSync(filePath, "utf-8");

		// セクション全体を削除（## rulename から次の ## まで、または文末まで）
		const lines = content.split("\n");
		const updatedLines: string[] = [];
		let skipMode = false;
		let ruleFound = false;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			// ルールのセクション開始を検出
			if (line === `## ${ruleName}`) {
				skipMode = true;
				ruleFound = true;
				continue;
			}

			// 次のセクション開始を検出（スキップモード終了）
			if (skipMode && line.startsWith("## ") && line !== `## ${ruleName}`) {
				skipMode = false;
			}

			// スキップモードでない場合のみ行を保持
			if (!skipMode) {
				updatedLines.push(line);
			}
		}

		if (ruleFound) {
			// 末尾の空行を整理
			while (updatedLines.length > 0 && updatedLines[updatedLines.length - 1] === "") {
				updatedLines.pop();
			}

			const updatedContent = updatedLines.join("\n") + (updatedLines.length > 0 ? "\n" : "");
			writeFileSync(filePath, updatedContent);
		}
	}

	// プロジェクト内のメモリファイルからルールを削除
	public async removeRuleFromProject(ruleName: string): Promise<string[]> {
		const projectFiles = this.findMemoryFiles("project");
		const updatedFiles: string[] = [];

		for (const file of projectFiles) {
			const content = readFileSync(file, "utf-8");
			if (content.includes(`## ${ruleName}`)) {
				await this.removeRule(file, ruleName);
				updatedFiles.push(basename(file));
			}
		}

		return updatedFiles;
	}

	// ファイルヘッダーを取得
	private getFileHeader(fileName: string): string {
		const headers: { [key: string]: string } = {
			"Agents.md": "# AI Agent Instructions\n\nAI coding rules for all AI coding assistants\n",
			"CLAUDE.md": "# Claude Code Instructions\n\nAI coding rules for Claude Code\n",
			"CLAUDE.local.md":
				"# Claude Code Instructions (Local)\n\nProject-specific AI coding rules for Claude Code\n",
			"COPILOT.md": "# GitHub Copilot Instructions\n\nAI coding rules for GitHub Copilot\n",
			"CURSOR.md": "# Cursor Instructions\n\nAI coding rules for Cursor\n",
			".cursorrules": "# Cursor Rules\n\n",
			"CODEIUM.md": "# Codeium Instructions\n\nAI coding rules for Codeium\n",
		};

		return headers[fileName] || `# ${fileName}\n\nAI coding rules managed by zxcv\n`;
	}

	// ルールファイルのパスを取得
	private getRulePath(rule: PulledRule): string {
		const parsed = this.parseRuleName(rule.name);
		const parts = [this.config.getRulesDir()];

		if (parsed.owner) {
			parts.push(`@${parsed.owner}`);
		}
		parts.push(`${parsed.name}.md`);

		return join(...parts);
	}

	// ルール名をパース
	private parseRuleName(fullName: string): { name: string; owner?: string } {
		const parts = fullName.split("/");
		if (parts.length === 2 && parts[0]?.startsWith("@")) {
			// @username/rulename or @org/rulename
			const owner = parts[0].substring(1);
			return {
				owner,
				name: parts[1] || "",
			};
		}
		return {
			name: fullName,
		};
	}

	// Agents.mdが作成された場合、CLAUDE.mdからのシンボリックリンクを作成
	public createAgentsSymlink(agentsFilePath: string): void {
		const dir = dirname(agentsFilePath);
		const claudeFilePath = join(dir, "CLAUDE.md");

		try {
			// 既存のCLAUDE.mdをチェック
			if (existsSync(claudeFilePath)) {
				const stats = lstatSync(claudeFilePath);

				// シンボリックリンクの場合は削除して再作成
				if (stats.isSymbolicLink()) {
					unlinkSync(claudeFilePath);
				} else {
					// 実ファイルの場合は何もしない（既存ファイルを保護）
					return;
				}
			}

			// Agents.mdへの相対パスでシンボリックリンクを作成
			symlinkSync("Agents.md", claudeFilePath);
		} catch (_error) {
			// シンボリックリンク作成に失敗しても処理を続行
			// （Windows等、シンボリックリンクが作れない環境への対応）
		}
	}
}
