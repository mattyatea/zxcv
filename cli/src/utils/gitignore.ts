import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { inquirer } from "./prompt.js";

export interface GitIgnoreOptions {
	filesToIgnore: string[];
	projectRoot: string;
}

/**
 * .git/info/exclude または .gitignore にエントリを追加
 */
export async function addToGitIgnore(options: GitIgnoreOptions): Promise<void> {
	const { filesToIgnore, projectRoot } = options;

	// gitリポジトリかチェック
	const gitDir = join(projectRoot, ".git");
	if (!existsSync(gitDir)) {
		console.log(chalk.yellow("⚠️  このプロジェクトはGitリポジトリではありません"));
		return;
	}

	// ユーザーに選択を促す
	const { ignoreType } = await inquirer.prompt([
		{
			type: "list",
			name: "ignoreType",
			message: chalk.cyan("📝 ファイルをGit管理から除外しますか？"),
			choices: [
				{
					name: chalk.green("✓ .git/info/exclude に追加 (推奨) - このリポジトリのみで無視"),
					value: "exclude",
				},
				{
					name: ".gitignore に追加 - プロジェクト全体で無視 (コミット対象)",
					value: "gitignore",
				},
				{ name: "追加しない", value: "none" },
			],
			default: "exclude",
		},
	]);

	if (ignoreType === "none") {
		return;
	}

	const targetFile =
		ignoreType === "exclude" ? join(gitDir, "info", "exclude") : join(projectRoot, ".gitignore");

	try {
		// ファイルの存在確認と読み込み
		let content = "";
		if (existsSync(targetFile)) {
			content = readFileSync(targetFile, "utf-8");
		} else {
			// .git/info/exclude の場合、ディレクトリを作成
			if (ignoreType === "exclude") {
				const infoDir = dirname(targetFile);
				if (!existsSync(infoDir)) {
					mkdirSync(infoDir, { recursive: true });
				}
			}
		}

		// 既存のエントリをチェック
		const lines = content.split("\n");
		const existingEntries = new Set(lines.map((line) => line.trim()));
		const newEntries: string[] = [];

		// セクションヘッダーを追加
		if (!content.includes("# zxcv generated files")) {
			newEntries.push("", "# zxcv generated files");
		}

		// 新しいエントリを追加
		for (const file of filesToIgnore) {
			if (!existingEntries.has(file)) {
				newEntries.push(file);
			}
		}

		if (newEntries.length > 0) {
			// ファイルの末尾に改行がない場合は追加
			const needsNewline = content.length > 0 && !content.endsWith("\n");
			const prefix = needsNewline ? "\n" : "";

			writeFileSync(targetFile, content + prefix + newEntries.join("\n") + "\n");

			const displayPath = ignoreType === "exclude" ? ".git/info/exclude" : ".gitignore";
			console.log(chalk.green(`✓ ${displayPath} に追加しました`));
			for (const entry of filesToIgnore) {
				if (!existingEntries.has(entry)) {
					console.log(chalk.gray(`  - ${entry}`));
				}
			}
		} else {
			console.log(chalk.gray("すべてのエントリは既に除外設定されています"));
		}
	} catch (error) {
		console.error(chalk.red("Failed to update ignore file"));
		if (error instanceof Error) {
			console.error(chalk.red(error.message));
		}
	}
}

/**
 * インストール時のgitignore設定を促す
 */
export async function promptGitIgnoreOnInstall(projectRoot: string): Promise<void> {
	const filesToIgnore = [
		"rules/", // ルールディレクトリ
		"Agents.md", // Agents.md
		"CLAUDE.md", // CLAUDE.md (シンボリックリンク含む)
		"CLAUDE.local.md", // CLAUDE.local.md
		"COPILOT.md", // COPILOT.md
	];

	await addToGitIgnore({
		filesToIgnore,
		projectRoot,
	});
}
