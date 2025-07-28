import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { ConfigManager } from "../config";
import { ApiClient } from "../utils/api";
import { FileManager } from "../utils/file";

export function createInstallCommand(): Command {
	return new Command("install")
		.description("Install all rules from metadata")
		.alias("i")
		.option("--frozen-lockfile", "Don't update metadata, install exactly what's specified")
		.action(async (options: { frozenLockfile?: boolean }) => {
			const spinner = ora("Installing rules...").start();
			const config = new ConfigManager();
			const api = new ApiClient(config);
			const fileManager = new FileManager(config);

			const metadata = config.loadMetadata();
			if (!metadata || metadata.rules.length === 0) {
				spinner.succeed(chalk.gray("No rules to install"));
				return;
			}

			spinner.text = `Installing ${metadata.rules.length} rule${metadata.rules.length > 1 ? "s" : ""}...`;

			let installedCount = 0;
			let errorCount = 0;

			for (const rule of metadata.rules) {
				try {
					// Check if already exists
					if (fileManager.ruleExists(rule)) {
						fileManager.createSymlink(rule);
						installedCount++;
						continue;
					}

					// Construct path
					let path = rule.name;
					if (rule.organization) {
						path = `@${rule.organization}/${rule.name}`;
					} else if (rule.owner) {
						path = `${rule.owner}/${rule.name}`;
					}

					spinner.text = `Installing ${path}...`;

					// Get rule from server
					const serverRule = await api.getRule(path);
					const { content } = await api.getRuleContent(serverRule.id);

					// Save rule
					fileManager.saveRule(serverRule, content);

					// Update version if not frozen
					if (!options.frozenLockfile) {
						rule.version = serverRule.version;
						rule.pulledAt = new Date().toISOString();
					}

					installedCount++;
				} catch (error) {
					errorCount++;
					const path = rule.organization
						? `@${rule.organization}/${rule.name}`
						: rule.owner
							? `${rule.owner}/${rule.name}`
							: rule.name;

					if (axios.isAxiosError(error) && error.response?.status === 404) {
						console.error(chalk.red(`\n✗ Rule not found: ${path}`));
					} else {
						console.error(chalk.red(`\n✗ Failed to install ${path}`));
					}
				}
			}

			// Save updated metadata if not frozen
			if (!options.frozenLockfile && installedCount > 0) {
				metadata.lastSync = new Date().toISOString();
				config.saveMetadata(metadata);
			}

			spinner.stop();

			if (installedCount > 0) {
				console.log(
					chalk.green(`\n✓ Installed ${installedCount} rule${installedCount > 1 ? "s" : ""}`),
				);
			}

			if (errorCount > 0) {
				console.log(
					chalk.red(`\n✗ Failed to install ${errorCount} rule${errorCount > 1 ? "s" : ""}`),
				);
				process.exit(1);
			}
		});
}
