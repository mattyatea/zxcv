import chalk from "chalk";
import { Command } from "commander";
import { ConfigManager } from "../config";

export function createListCommand(): Command {
	return new Command("list")
		.description("List all locally pulled rules")
		.alias("ls")
		.action(() => {
			const config = new ConfigManager();
			const metadata = config.loadMetadata();

			if (!metadata || metadata.rules.length === 0) {
				console.log(chalk.yellow("No rules pulled yet"));
				return;
			}

			console.log(chalk.bold("\nLocal Rules:"));
			console.log(chalk.gray("─".repeat(60)));

			for (const rule of metadata.rules) {
				// rule.name にはすでにフルパス形式が入っている
				console.log(chalk.cyan(rule.name));
				console.log(chalk.gray(`  Version: ${rule.version}`));
				console.log(chalk.gray(`  Pulled: ${new Date(rule.pulledAt).toLocaleString()}`));
				console.log();
			}

			console.log(chalk.gray("─".repeat(60)));
			console.log(chalk.gray(`Total: ${metadata.rules.length} rules`));
			console.log(chalk.gray(`Last sync: ${new Date(metadata.lastSync).toLocaleString()}`));
		});
}
