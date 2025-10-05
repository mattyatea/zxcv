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

	// プロジェクトレベル（推奨）
	if (projectFiles.length > 0) {
		choices.push(new Separator(chalk.green("=== プロジェクト（推奨） ===")));
		for (const file of projectFiles) {
			choices.push({
				name: `📄 ${basename(file)}`,
				value: file,
			});
		}
	}

	// 新規作成オプション（プロジェクト）
	choices.push(
		new Separator(chalk.green("=== 新規作成（プロジェクト） ===")),
		{ name: "📝 Agents.md を作成 (推奨)", value: "new:project:Agents.md" },
		{ name: "📝 CLAUDE.md を作成", value: "new:project:CLAUDE.md" },
		{ name: "📝 CLAUDE.local.md を作成", value: "new:project:CLAUDE.local.md" },
		{ name: "📝 COPILOT.md を作成", value: "new:project:COPILOT.md" },
	);

	// ユーザーレベル（オプション）
	if (userFiles.length > 0) {
		choices.push(new Separator(chalk.gray("=== ユーザーレベル ===")));
		for (const file of userFiles) {
			choices.push({
				name: chalk.gray(`📄 ~/${basename(file)}`),
				value: file,
			});
		}
	}

	// 新規作成オプション（ユーザー）
	choices.push(
		new Separator(chalk.gray("=== 新規作成（ユーザー） ===")),
		{ name: chalk.gray("📝 ~/Agents.md を作成 (推奨)"), value: "new:user:Agents.md" },
		{ name: chalk.gray("📝 ~/CLAUDE.md を作成"), value: "new:user:CLAUDE.md" },
	);

	// カスタム
	choices.push(new Separator("━━━━━━━━━━"), { name: "✏️  カスタムパスを入力", value: "custom" });

	const { selectedFile } = await inquirer.prompt([
		{
			type: "list",
			name: "selectedFile",
			message: chalk.cyan(`📝 ${ruleName} をどこに記録しますか？`),
			choices,
			pageSize: 15,
		},
	]);

	if (selectedFile === "custom") {
		const { customPath } = await inquirer.prompt([
			{
				type: "input",
				name: "customPath",
				message: "ファイルパス (例: ./AI-RULES.md, ~/my-rules.md):",
				validate: (input: string) => {
					if (!input?.trim()) {
						return "有効なファイルパスを入力してください";
					}
					return true;
				},
			},
		]);

		const resolved = memoryManager.resolveFilePath(customPath);

		// プロジェクト外の場合は確認
		if (!resolved.startsWith(process.cwd())) {
			console.log(chalk.yellow("\n⚠️  注意: プロジェクト外のファイルを指定しています"));

			const { confirmCustom } = await inquirer.prompt([
				{
					type: "confirm",
					name: "confirmCustom",
					message: "続行しますか？",
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

		if (scope === "user") {
			console.log(chalk.yellow("\n📌 注: ユーザーレベルのファイルを作成します"));
		}

		return newPath;
	}

	return selectedFile;
}
