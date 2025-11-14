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
		console.log(chalk.yellow("This is not a Git repository"));
		return;
	}

	// ユーザーに選択を促す
	const { ignoreType } = await inquirer.prompt([
		{
			type: "list",
			name: "ignoreType",
			message: "Add generated files to Git ignore?",
			choices: [
				{
					name: ".git/info/exclude (recommended, local only)",
					value: "exclude",
				},
				{
					name: ".gitignore (project-wide, committed)",
					value: "gitignore",
				},
				{ name: "Don't add", value: "none" },
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
		} else if (ignoreType === "exclude") {
			// .git/info/exclude の場合、ディレクトリを作成
			const infoDir = dirname(targetFile);
			if (!existsSync(infoDir)) {
				mkdirSync(infoDir, { recursive: true });
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

			writeFileSync(targetFile, `${content + prefix + newEntries.join("\n")}\n`);

			const displayPath = ignoreType === "exclude" ? ".git/info/exclude" : ".gitignore";
			console.log(chalk.green(`Added to ${displayPath}`));
			for (const entry of filesToIgnore) {
				if (!existingEntries.has(entry)) {
					console.log(chalk.gray(`  ${entry}`));
				}
			}
		} else {
			console.log(chalk.gray("All entries already ignored"));
		}
	} catch (error) {
		console.error(chalk.red("Failed to update ignore file"));
		if (error instanceof Error) {
			console.error(chalk.red(error.message));
		}
	}
}

/**
 * ファイルがgitignoreまたはexcludeに記載されているかチェック
 */
function isIgnoredByGit(projectRoot: string, filesToCheck: string[]): boolean {
	const gitDir = join(projectRoot, ".git");
	if (!existsSync(gitDir)) {
		return false; // Gitリポジトリではない
	}

	const gitignorePath = join(projectRoot, ".gitignore");
	const excludePath = join(gitDir, "info", "exclude");

	// .gitignoreと.git/info/excludeの内容を取得
	const contents: string[] = [];

	if (existsSync(gitignorePath)) {
		contents.push(readFileSync(gitignorePath, "utf-8"));
	}

	if (existsSync(excludePath)) {
		contents.push(readFileSync(excludePath, "utf-8"));
	}

	if (contents.length === 0) {
		return false; // どちらも存在しない
	}

	// すべての行を集めて、パターンマッチング
	const allLines = contents.join("\n").split("\n");
	const patterns = allLines
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("#"));

	// すべてのファイルがいずれかのパターンにマッチするかチェック
	return filesToCheck.every((file) =>
		patterns.some((pattern) => {
			// 完全一致
			if (pattern === file) {
				return true;
			}

			// ディレクトリパターン（trailing slash）
			if (pattern.endsWith("/") && file.endsWith("/")) {
				return pattern === file;
			}

			return false;
		}),
	);
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

	// すでにgitignoreまたはexcludeに記載されているかチェック
	if (isIgnoredByGit(projectRoot, filesToIgnore)) {
		return; // すでに記載されている場合は何もしない
	}

	await addToGitIgnore({
		filesToIgnore,
		projectRoot,
	});
}
