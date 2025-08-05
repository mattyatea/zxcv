import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import chalk from "chalk";

export interface PromptQuestion {
	type: "input" | "password" | "confirm" | "list";
	name: string;
	message: string;
	default?: string | boolean | number;
	choices?: Array<{ name: string; value: string | number }> | string[];
	mask?: string;
	validate?: (input: any, answers?: any) => boolean | string;
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
			selectedIndex = parseInt(answer) - 1;
		} while (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= choices.length);

		return choices[selectedIndex].value;
	}

	async prompt(questions: PromptQuestion[]): Promise<Record<string, any>> {
		const answers: Record<string, any> = {};

		for (const question of questions) {
			// Pass answers to validation for dependent questions
			const questionWithAnswers = { ...question };
			if (question.validate) {
				const originalValidate = question.validate;
				questionWithAnswers.validate = (input: any) => originalValidate(input, answers);
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
					throw new Error(`Unsupported prompt type: ${(question as any).type}`);
			}
		}

		this.close();
		return answers;
	}
}

export const inquirer = {
	prompt: async (questions: PromptQuestion[]): Promise<Record<string, any>> => {
		const prompt = new Prompt();
		return prompt.prompt(questions);
	},
};
