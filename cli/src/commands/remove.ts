import chalk from "chalk";
import { Command } from "commander";
import { ConfigManager } from "../config";
import { FileManager } from "../utils/file";
import { MemoryFileManager } from "../utils/memory-file";
import { inquirer } from "../utils/prompt.js";
import { ora } from "../utils/spinner.js";

export function createRemoveCommand(): Command {
	return new Command("remove")
		.description("Remove rules from your project")
		.alias("rm")
		.argument("[packages...]", "Rule packages to remove")
		.option("-g, --global", "Remove globally")
		.option("-i, --interactive", "Interactive mode to select rules to remove")
		.action(async (packages: string[], options: { global?: boolean; interactive?: boolean }) => {
			const config = new ConfigManager();
			const fileManager = new FileManager(config);
			const memoryManager = new MemoryFileManager(config);

			const metadata = config.loadMetadata();
			if (!metadata || metadata.rules.length === 0) {
				console.log(chalk.yellow("No rules installed"));
				return;
			}

			let packagesToRemove = packages;

			if (options?.interactive || packages.length === 0) {
				// Interactive mode: select rules to remove
				const choices = metadata.rules.map((rule) => ({
					name: `${chalk.cyan(rule.name)} ${chalk.gray(`v${rule.version}`)}`,
					value: rule.name,
				}));

				const { selectedRules } = await inquirer.prompt([
					{
						type: "checkbox",
						name: "selectedRules",
						message: "Select rules to remove (use space to select):",
						choices,
						pageSize: 15,
					},
				]);

				if (selectedRules.length === 0) {
					console.log(chalk.yellow("No rules selected"));
					return;
				}

				packagesToRemove = selectedRules;
			}

			const spinner = ora("Removing rules...").start();

			let removedCount = 0;
			const notFoundPackages: string[] = [];
			const removedRules: string[] = [];

			for (const pkg of packagesToRemove) {
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
				removedRules.push(fullName);
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

					// メモリファイルからも削除
					for (const ruleName of removedRules) {
						const updatedFiles = await memoryManager.removeRuleFromProject(ruleName);
						if (updatedFiles.length > 0) {
							console.log(chalk.gray(`  Removed from ${updatedFiles.join(", ")}`));
						}
					}

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
