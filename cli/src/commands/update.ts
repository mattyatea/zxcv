import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import { ConfigManager } from "../config";
import { ApiClient } from "../utils/api";
import { FileManager } from "../utils/file";
import { ora } from "../utils/spinner.js";

export function createUpdateCommand(): Command {
	return new Command("update")
		.description("Update rules to their latest versions")
		.alias("up")
		.argument("[packages...]", "Specific packages to update")
		.option("-g, --global", "Update global packages")
		.option("--latest", "Update to the latest version")
		.action(async (packages: string[], _options: { global?: boolean; latest?: boolean }) => {
			const spinner = ora("Checking for updates...").start();
			const config = new ConfigManager();
			const api = new ApiClient(config);
			const fileManager = new FileManager(config);

			const metadata = config.loadMetadata();
			if (!metadata || metadata.rules.length === 0) {
				spinner.fail(chalk.yellow("No rules installed"));
				return;
			}

			let rulesToUpdate = metadata.rules;

			// Filter specific packages if provided
			if (packages && packages.length > 0) {
				rulesToUpdate = metadata.rules.filter((rule) => {
					return packages.some((pkg) => {
						// rule.name にはフルパス形式が入っているので直接比較
						return rule.name === pkg;
					});
				});
			}

			if (rulesToUpdate.length === 0) {
				spinner.fail(chalk.yellow("No matching rules found"));
				return;
			}

			spinner.text(
				`Checking ${rulesToUpdate.length} rule${rulesToUpdate.length > 1 ? "s" : ""} for updates...`,
			);

			let updatedCount = 0;
			let errorCount = 0;

			for (const rule of rulesToUpdate) {
				try {
					// rule.name にはすでにフルパス形式が入っている
					const path = rule.name;

					// Get latest version from server
					const latestRule = await api.getRule(path);

					// Check if update is needed
					if (latestRule.version === rule.version) {
						continue;
					}

					spinner.text(`Updating ${path}...`);

					// Get content
					const { content } = await api.getRuleContent(latestRule.id);

					// Update local file
					fileManager.updateLocalRule(rule, content);

					// Update metadata
					rule.version = latestRule.version;
					rule.pulledAt = new Date().toISOString();

					updatedCount++;
				} catch (error) {
					errorCount++;
					if (axios.isAxiosError(error) && error.response?.status === 404) {
						console.error(chalk.red(`\n✗ Rule not found: ${rule.name}`));
					}
				}
			}

			// Save updated metadata
			if (updatedCount > 0) {
				metadata.lastSync = new Date().toISOString();
				config.saveMetadata(metadata);
			}

			spinner.stop();

			if (updatedCount > 0) {
				console.log(chalk.green(`\n✓ Updated ${updatedCount} rule${updatedCount > 1 ? "s" : ""}`));
			} else {
				console.log(chalk.gray("\n✓ All rules are up to date"));
			}

			if (errorCount > 0) {
				console.log(
					chalk.red(`\n✗ Failed to update ${errorCount} rule${errorCount > 1 ? "s" : ""}`),
				);
			}
		});
}
