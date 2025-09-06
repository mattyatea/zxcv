import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { stdin, stdout } from "node:process";
import * as readline from "node:readline/promises";
import chalk from "chalk";
import { ConfigManager } from "../config";
import { MemoryFileManager } from "./memory-file";

export interface PromptQuestion {
	type: "input" | "password" | "confirm" | "list";
	name: string;
	message: string;
	default?: string | boolean | number;
	choices?: Array<{ name: string; value: string | number }> | string[];
	mask?: string;
	validate?: (
		input: string | boolean | number,
		answers?: Record<string, string | boolean | number>,
	) => boolean | string;
}

class Prompt {
	private rl: readline.Interface;

	constructor() {
		this.rl = readline.createInterface({ input: stdin, output: stdout });
	}

	async close() {
		this.rl.close();
	}

	async input(question: PromptQuestion): Promise<string> {
		const defaultText = question.default ? chalk.gray(` (${question.default})`) : "";
		let isValid = false;
		let answer = "";

		while (!isValid) {
			answer = await this.rl.question(`${question.message}${defaultText}: `);
			if (!answer && question.default) {
				answer = question.default as string;
			}

			if (question.validate) {
				const result = question.validate(answer);
				if (result === true) {
					isValid = true;
				} else if (typeof result === "string") {
					console.log(chalk.red(result));
				} else {
					console.log(chalk.red("Invalid input"));
				}
			} else {
				isValid = true;
			}
		}

		return answer;
	}

	async password(question: PromptQuestion): Promise<string> {
		let isValid = false;
		let answer = "";

		while (!isValid) {
			answer = await new Promise<string>((resolve) => {
				let value = "";
				const questionText = `${question.message}: `;
				process.stdout.write(questionText);

				process.stdin.setRawMode(true);
				process.stdin.resume();
				process.stdin.setEncoding("utf8");

				const onData = (char: string) => {
					switch (char) {
						case "\n":
						case "\r":
						case "\u0004":
							process.stdin.setRawMode(false);
							process.stdin.pause();
							process.stdin.removeListener("data", onData);
							process.stdout.write("\n");
							resolve(value);
							break;
						case "\u0003": // Ctrl+C
							process.exit();
							break;
						case "\u007f": // Backspace
							if (value.length > 0) {
								value = value.slice(0, -1);
								process.stdout.write("\b \b");
							}
							break;
						default:
							value += char;
							process.stdout.write(question.mask || "*");
					}
				};

				process.stdin.on("data", onData);
			});

			if (question.validate) {
				const result = question.validate(answer);
				if (result === true) {
					isValid = true;
				} else if (typeof result === "string") {
					console.log(chalk.red(result));
				} else {
					console.log(chalk.red("Invalid input"));
				}
			} else {
				isValid = true;
			}
		}

		return answer;
	}

	async confirm(question: PromptQuestion): Promise<boolean> {
		const defaultText = question.default !== undefined ? (question.default ? "Y/n" : "y/N") : "y/n";
		const answer = await this.rl.question(`${question.message} (${defaultText}): `);

		if (!answer && question.default !== undefined) {
			return question.default as boolean;
		}

		return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
	}

	async list(question: PromptQuestion): Promise<string | number> {
		if (!question.choices || question.choices.length === 0) {
			throw new Error("List prompt requires choices");
		}

		console.log(question.message);

		const choices = question.choices.map((choice, index) => {
			if (typeof choice === "string") {
				return { name: choice, value: choice, index };
			}
			return { ...choice, index };
		});

		choices.forEach((choice, index) => {
			console.log(`  ${chalk.cyan(`${index + 1})`)} ${choice.name}`);
		});

		let answer: string;
		let selectedIndex: number;

		do {
			answer = await this.rl.question("\nSelect an option (enter number): ");
			selectedIndex = Number.parseInt(answer) - 1;
		} while (Number.isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= choices.length);

		return choices[selectedIndex].value;
	}

	async prompt(questions: PromptQuestion[]): Promise<Record<string, string | boolean | number>> {
		const answers: Record<string, string | boolean | number> = {};

		for (const question of questions) {
			// Pass answers to validation for dependent questions
			const questionWithAnswers = { ...question };
			if (question.validate) {
				const originalValidate = question.validate;
				questionWithAnswers.validate = (input: string | boolean | number) =>
					originalValidate(input, answers);
			}

			switch (question.type) {
				case "input":
					answers[question.name] = await this.input(questionWithAnswers);
					break;
				case "password":
					answers[question.name] = await this.password(questionWithAnswers);
					break;
				case "confirm":
					answers[question.name] = await this.confirm(questionWithAnswers);
					break;
				case "list":
					answers[question.name] = await this.list(questionWithAnswers);
					break;
				default:
					throw new Error(`Unsupported prompt type: ${question.type}`);
			}
		}

		this.close();
		return answers;
	}
}

export const inquirer = {
	prompt: async (
		questions: PromptQuestion[],
	): Promise<Record<string, string | boolean | number>> => {
		const prompt = new Prompt();
		return prompt.prompt(questions);
	},
};

// メモリファイル選択用の対話式プロンプト
export async function promptMemoryFile(ruleName: string): Promise<string> {
	const config = new ConfigManager();
	const memoryManager = new MemoryFileManager(config);

	// プロジェクトとユーザーレベルのファイルを検索
	const projectFiles = memoryManager.findMemoryFiles("project");
	const userFiles = memoryManager.findMemoryFiles("user");

	const choices: Array<{ name: string; value: string }> = [];

	// プロジェクトレベル（推奨）
	if (projectFiles.length > 0) {
		choices.push({
			name: chalk.green("=== プロジェクト（推奨） ==="),
			value: "separator",
		});
		for (const file of projectFiles) {
			choices.push({
				name: `  📄 ${basename(file)}`,
				value: file,
			});
		}
	}

	// 新規作成オプション（プロジェクト）
	choices.push(
		{ name: chalk.green("=== 新規作成（プロジェクト） ==="), value: "separator" },
		{ name: "  📝 CLAUDE.md を作成", value: "new:project:CLAUDE.md" },
		{ name: "  📝 CLAUDE.local.md を作成", value: "new:project:CLAUDE.local.md" },
		{ name: "  📝 COPILOT.md を作成", value: "new:project:COPILOT.md" },
	);

	// ユーザーレベル（オプション）
	if (userFiles.length > 0) {
		choices.push({
			name: chalk.gray("=== ユーザーレベル ==="),
			value: "separator",
		});
		for (const file of userFiles) {
			choices.push({
				name: chalk.gray(`  📄 ~/​${basename(file)}`),
				value: file,
			});
		}
	}

	// 新規作成オプション（ユーザー）
	choices.push(
		{ name: chalk.gray("=== 新規作成（ユーザー） ==="), value: "separator" },
		{ name: chalk.gray("  📝 ~/CLAUDE.md を作成"), value: "new:user:CLAUDE.md" },
	);

	// カスタム
	choices.push(
		{ name: "━━━━━━━━━━", value: "separator" },
		{ name: "✏️  カスタムパスを入力", value: "custom" },
	);

	console.log(chalk.cyan(`\n📝 ${ruleName} をどこに記録しますか？`));

	// 選択肢を表示（セパレーターを除いてインデックスを計算）
	const validChoices = choices.filter((c) => c.value !== "separator");
	choices.forEach((choice, index) => {
		if (choice.value === "separator") {
			console.log(choice.name);
		} else {
			const choiceIndex = validChoices.findIndex((c) => c.value === choice.value) + 1;
			console.log(`  ${chalk.cyan(`${choiceIndex})`)} ${choice.name}`);
		}
	});

	let answer: string;
	let selectedIndex: number;

	do {
		answer = await new Promise<string>((resolve) => {
			const rl = readline.createInterface({ input: stdin, output: stdout });
			rl.question("\n選択してください (番号を入力): ").then((answer: string) => {
				rl.close();
				resolve(answer);
			});
		});
		selectedIndex = Number.parseInt(answer) - 1;
	} while (
		Number.isNaN(selectedIndex) ||
		selectedIndex < 0 ||
		selectedIndex >= validChoices.length
	);

	const choice = validChoices[selectedIndex].value;

	if (choice === "custom") {
		const customPath = await new Promise<string>((resolve) => {
			const rl = readline.createInterface({ input: stdin, output: stdout });
			rl.question("ファイルパス (例: ./AI-RULES.md, ~/my-rules.md): ").then((answer: string) => {
				rl.close();
				resolve(answer);
			});
		});

		if (!customPath?.trim()) {
			throw new Error("有効なファイルパスを入力してください");
		}

		const resolved = memoryManager.resolveFilePath(customPath);

		// プロジェクト外の場合は確認
		if (!resolved.startsWith(process.cwd())) {
			console.log(chalk.yellow("\n⚠️  注意: プロジェクト外のファイルを指定しています"));

			const confirmCustom = await new Promise<boolean>((resolve) => {
				const rl = readline.createInterface({ input: stdin, output: stdout });
				rl.question("続行しますか？ (y/N): ").then((answer: string) => {
					rl.close();
					resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
				});
			});

			if (!confirmCustom) {
				// 再度選択
				return promptMemoryFile(ruleName);
			}
		}

		return resolved;
	}

	if (choice.startsWith("new:")) {
		const [, scope, fileName] = choice.split(":");
		const dir = scope === "user" ? homedir() : process.cwd();
		const newPath = join(dir, fileName);

		if (scope === "user") {
			console.log(chalk.yellow("\n📌 注: ユーザーレベルのファイルを作成します"));
		}

		return newPath;
	}

	return choice;
}
