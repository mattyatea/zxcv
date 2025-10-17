import chalk from "chalk";
import { Command } from "commander";
import { ConfigManager } from "../config";
import { inquirer } from "../utils/prompt.js";

export function createListCommand(): Command {
	return new Command("list")
		.description("List all locally pulled rules")
		.alias("ls")
		.option("-i, --interactive", "Interactive mode to select and manage rules")
		.action(async (options?: { interactive?: boolean }) => {
			const config = new ConfigManager();
			const metadata = config.loadMetadata();

			if (!metadata || metadata.rules.length === 0) {
				console.log(chalk.yellow("No rules pulled yet"));
				return;
			}

			if (options?.interactive) {
				// Interactive mode
				const choices = metadata.rules.map((rule) => ({
					name: `${chalk.cyan(rule.name)} ${chalk.gray(`v${rule.version}`)}`,
					value: rule.name,
				}));

				const { selectedRule } = await inquirer.prompt([
					{
						type: "list",
						name: "selectedRule",
						message: "Select a rule to view details:",
						choices: [
							...choices,
							new inquirer.Separator(),
							{ name: chalk.gray("← Back"), value: "back" },
						],
						pageSize: 15,
					},
				]);

				if (selectedRule === "back") {
					return;
				}

				const rule = metadata.rules.find((r) => r.name === selectedRule);
				if (!rule) {
					return;
				}

				// Show rule details
				console.log(chalk.bold(`\n${rule.name}`));
				console.log(chalk.gray("─".repeat(60)));
				console.log(chalk.gray(`Version: ${rule.version}`));
				console.log(
					chalk.gray(`Pulled: ${new Date(rule.pulledAt).toLocaleString()}`),
				);
				if (rule.description) {
					console.log(chalk.gray(`Description: ${rule.description}`));
				}
				if (rule.tags && rule.tags.length > 0) {
					console.log(chalk.gray(`Tags: ${rule.tags.join(", ")}`));
				}

				// Ask for action
				const { action } = await inquirer.prompt([
					{
						type: "list",
						name: "action",
						message: "What would you like to do?",
						choices: [
							{ name: "View content", value: "view" },
							{ name: "Update to latest version", value: "update" },
							{ name: "Remove", value: "remove" },
							new inquirer.Separator(),
							{ name: chalk.gray("← Back"), value: "back" },
						],
					},
				]);

				if (action === "view") {
					const { readFileSync } = await import("node:fs");
					const { join } = await import("node:path");
					try {
						const content = readFileSync(
							join(config.getRulesDir(), `${selectedRule}.md`),
							"utf-8",
						);
						console.log(`\n${chalk.gray("─".repeat(60))}`);
						console.log(content);
						console.log(chalk.gray("─".repeat(60)));
					} catch (error) {
						console.error(chalk.red("Failed to read rule content"));
					}
				} else if (action === "update") {
					const { exec } = await import("node:child_process");
					const { promisify } = await import("node:util");
					const execAsync = promisify(exec);
					try {
						await execAsync(`zxcv update ${selectedRule}`);
					} catch (error) {
						console.error(chalk.red("Failed to update rule"));
					}
				} else if (action === "remove") {
					const { exec } = await import("node:child_process");
					const { promisify } = await import("node:util");
					const execAsync = promisify(exec);
					try {
						await execAsync(`zxcv remove ${selectedRule}`);
					} catch (error) {
						console.error(chalk.red("Failed to remove rule"));
					}
				}
			} else {
				// Display mode
				console.log(chalk.bold("\nLocal Rules:"));
				console.log(chalk.gray("─".repeat(60)));

				for (const rule of metadata.rules) {
					// rule.name にはすでにフルパス形式が入っている
					console.log(chalk.cyan(rule.name));
					console.log(chalk.gray(`  Version: ${rule.version}`));
					console.log(
						chalk.gray(`  Pulled: ${new Date(rule.pulledAt).toLocaleString()}`),
					);
					console.log();
				}

				console.log(chalk.gray("─".repeat(60)));
				console.log(chalk.gray(`Total: ${metadata.rules.length} rules`));
				console.log(
					chalk.gray(
						`Last sync: ${new Date(metadata.lastSync).toLocaleString()}`,
					),
				);
				console.log(chalk.gray(`\nUse 'zxcv list -i' for interactive mode`));
			}
		});
}
