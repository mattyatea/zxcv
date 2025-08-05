import chalk from "chalk";
import { Command } from "commander";
import { ConfigManager } from "../config";
import { FileManager } from "../utils/file";
import { inquirer } from "../utils/prompt.js";
import { ora } from "../utils/spinner.js";

export function createRemoveCommand(): Command {
	return new Command("remove")
		.description("Remove rules from your project")
		.alias("rm")
		.argument("<packages...>", "Rule packages to remove")
		.option("-g, --global", "Remove globally")
		.action(async (packages: string[], _options: { global?: boolean }) => {
			const spinner = ora("Removing rules...").start();
			const config = new ConfigManager();
			const fileManager = new FileManager(config);

			const metadata = config.loadMetadata();
			if (!metadata || metadata.rules.length === 0) {
				spinner.fail(chalk.yellow("No rules installed"));
				return;
			}

			let removedCount = 0;
			const notFoundPackages: string[] = [];

			for (const pkg of packages) {
				// Parse package path
				const pathParts = pkg.split("/");
				let organization: string | undefined;
				let owner: string | undefined;
				let ruleName: string;

				if (pathParts.length === 2 && pathParts[0].startsWith("@")) {
					organization = pathParts[0].substring(1);
					ruleName = pathParts[1];
				} else if (pathParts.length === 2) {
					owner = pathParts[0];
					ruleName = pathParts[1];
				} else if (pathParts.length === 1) {
					ruleName = pathParts[0];
				} else {
					notFoundPackages.push(pkg);
					continue;
				}

				// フルパス形式で比較（すべて@プレフィックス付き）
				const fullName = organization
					? `@${organization}/${ruleName}`
					: owner
						? `@${owner}/${ruleName}`
						: ruleName;

				const ruleIndex = metadata.rules.findIndex((r) => r.name === fullName);

				if (ruleIndex === -1) {
					notFoundPackages.push(pkg);
					continue;
				}

				// Remove symlink
				fileManager.removeSymlink(metadata.rules[ruleIndex]);

				// Remove from metadata
				metadata.rules.splice(ruleIndex, 1);
				removedCount++;
			}

			spinner.stop();

			if (removedCount > 0) {
				// Confirm removal
				const { confirm } = await inquirer.prompt([
					{
						type: "confirm",
						name: "confirm",
						message: `Remove ${removedCount} rule${removedCount > 1 ? "s" : ""}?`,
						default: true,
					},
				]);

				if (confirm) {
					config.saveMetadata(metadata);
					console.log(
						chalk.green(`\n✓ Removed ${removedCount} rule${removedCount > 1 ? "s" : ""}`),
					);
				} else {
					console.log(chalk.yellow("\nRemoval cancelled"));
				}
			}

			if (notFoundPackages.length > 0) {
				console.log(chalk.yellow(`\n⚠ Not found: ${notFoundPackages.join(", ")}`));
			}
		});
}
