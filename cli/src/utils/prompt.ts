import inquirerLib from "inquirer";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import chalk from "chalk";
import { ConfigManager } from "../config";
import { MemoryFileManager } from "./memory-file";

export const inquirer = inquirerLib;
const Separator = inquirerLib.Separator;

// メモリファイル選択用の対話式プロンプト
export async function promptMemoryFile(ruleName: string): Promise<string> {
	const config = new ConfigManager();
	const memoryManager = new MemoryFileManager(config);

	// プロジェクトとユーザーレベルのファイルを検索
	const projectFiles = memoryManager.findMemoryFiles("project");
	const userFiles = memoryManager.findMemoryFiles("user");

	const choices: Array<{ name: string; value: string } | InstanceType<typeof Separator>> = [];

	// プロジェクトレベル
	if (projectFiles.length > 0) {
		choices.push(new Separator("Project files"));
		for (const file of projectFiles) {
			choices.push({
				name: basename(file),
				value: file,
			});
		}
	}

	// 新規作成オプション（プロジェクト）
	choices.push(
		new Separator("Create new (project)"),
		{ name: "Agents.md", value: "new:project:Agents.md" },
		{ name: "CLAUDE.md", value: "new:project:CLAUDE.md" },
		{ name: "CLAUDE.local.md", value: "new:project:CLAUDE.local.md" },
		{ name: "COPILOT.md", value: "new:project:COPILOT.md" },
	);

	// ユーザーレベル（オプション）
	if (userFiles.length > 0) {
		choices.push(new Separator("User files"));
		for (const file of userFiles) {
			choices.push({
				name: `~/${basename(file)}`,
				value: file,
			});
		}
	}

	// 新規作成オプション（ユーザー）
	choices.push(
		new Separator("Create new (user)"),
		{ name: "~/Agents.md", value: "new:user:Agents.md" },
		{ name: "~/CLAUDE.md", value: "new:user:CLAUDE.md" },
	);

	// カスタム
	choices.push(new Separator(), { name: "Custom path...", value: "custom" });

	const { selectedFile } = await inquirer.prompt([
		{
			type: "list",
			name: "selectedFile",
			message: `Where do you want to save ${ruleName}?`,
			choices,
			pageSize: 15,
		},
	]);

	if (selectedFile === "custom") {
		const { customPath } = await inquirer.prompt([
			{
				type: "input",
				name: "customPath",
				message: "File path (e.g. ./AI-RULES.md, ~/my-rules.md):",
				validate: (input: string) => {
					if (!input?.trim()) {
						return "Please enter a valid file path";
					}
					return true;
				},
			},
		]);

		const resolved = memoryManager.resolveFilePath(customPath);

		// プロジェクト外の場合は確認
		if (!resolved.startsWith(process.cwd())) {
			console.log(chalk.yellow("\nWarning: File is outside project directory"));

			const { confirmCustom } = await inquirer.prompt([
				{
					type: "confirm",
					name: "confirmCustom",
					message: "Continue?",
					default: false,
				},
			]);

			if (!confirmCustom) {
				// 再度選択
				return promptMemoryFile(ruleName);
			}
		}

		return resolved;
	}

	if (selectedFile.startsWith("new:")) {
		const [, scope, fileName] = selectedFile.split(":");
		const dir = scope === "user" ? homedir() : process.cwd();
		const newPath = join(dir, fileName);

		return newPath;
	}

	return selectedFile;
}
