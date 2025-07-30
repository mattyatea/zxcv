import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { ConfigManager } from "../config";
import { ApiClient } from "../utils/api";
import { FileManager } from "../utils/file";

export function createSyncCommand(): Command {
	return new Command("sync")
		.description("Sync all pulled rules with remote server")
		.option("-f, --force", "Force sync even if there are no changes")
		.action(async (options: { force?: boolean }) => {
			const spinner = ora("Syncing rules...").start();
			const config = new ConfigManager();
			const api = new ApiClient(config);
			const fileManager = new FileManager(config);

			try {
				// Load metadata
				const metadata = config.loadMetadata();
				if (!metadata || metadata.rules.length === 0) {
					spinner.info(chalk.yellow("No rules to sync"));
					return;
				}

				spinner.text = `Syncing ${metadata.rules.length} rules...`;

				let updatedCount = 0;
				let errorCount = 0;

				for (const pulledRule of metadata.rules) {
					try {
						// Use the rule name as stored in metadata (already in full path format)
						const path = pulledRule.name;

						// Get latest version from server
						const rule = await api.getRule(path);

						// Check if update is needed
						if (rule.version === pulledRule.version && !options.force) {
							continue;
						}

						// Get content
						const { content } = await api.getRuleContent(rule.id);

						// Update local file
						fileManager.updateLocalRule(pulledRule, content);

						// Update metadata
						pulledRule.version = rule.version;
						pulledRule.pulledAt = new Date().toISOString();

						updatedCount++;
					} catch (error) {
						errorCount++;
						if (axios.isAxiosError(error) && error.response?.status === 404) {
							console.error(chalk.red(`Rule not found: ${pulledRule.name}`));
						}
					}
				}

				// Save updated metadata
				metadata.lastSync = new Date().toISOString();
				config.saveMetadata(metadata);

				if (updatedCount > 0 || errorCount > 0) {
					spinner.succeed(
						chalk.green(
							`Sync completed: ${updatedCount} updated, ${errorCount} errors, ${
								metadata.rules.length - updatedCount - errorCount
							} unchanged`,
						),
					);
				} else {
					spinner.info(chalk.yellow("All rules are up to date"));
				}
			} catch (error) {
				spinner.fail(chalk.red("Failed to sync rules"));
				if (axios.isAxiosError(error)) {
					console.error(chalk.red(error.response?.data?.message || error.message));
				} else {
					console.error(chalk.red("An unexpected error occurred"));
				}
				process.exit(1);
			}
		});
}
