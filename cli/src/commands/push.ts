import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import { ConfigManager } from "../config";
import type { PulledRule } from "../types";
import { ApiClient } from "../utils/api";
import { FileManager } from "../utils/file";
import { inquirer } from "../utils/prompt.js";
import { ora } from "../utils/spinner.js";

export function createPushCommand(): Command {
	return new Command("push")
		.description("Push local rules to remote server")
		.argument("<path>", "Rule path (e.g., rulename or @org/rulename)")
		.option("-m, --message <message>", "Changelog message for the update")
		.action(async (path: string, options: { message?: string }) => {
			const spinner = ora("Pushing rule...").start();
			const config = new ConfigManager();
			const api = new ApiClient(config);
			const fileManager = new FileManager(config);

			try {
				// Check authentication
				if (!config.getAuthToken()) {
					spinner.fail(chalk.red("Authentication required. Please login first."));
					process.exit(1);
				}

				// Parse path
				const pathParts = path.split("/");
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
					throw new Error("Invalid rule path format");
				}

				// Read local rule
				spinner.text("Reading local rule...");
				const content = fileManager.readLocalRule(ruleName, owner, organization);
				if (!content) {
					spinner.fail(chalk.red("Rule not found locally"));
					process.exit(1);
				}

				// Check if rule exists in metadata
				const metadata = config.loadMetadata();

				// フルパス形式で比較（すべて@プレフィックス付き）
				const fullName = organization
					? `@${organization}/${ruleName}`
					: owner
						? `@${owner}/${ruleName}`
						: ruleName;

				const existingRule = metadata?.rules.find((r) => r.name === fullName);

				if (existingRule) {
					// Update existing rule
					spinner.text("Updating remote rule...");

					let changelog = options.message;
					if (!changelog) {
						const answer = await inquirer.prompt([
							{
								type: "input",
								name: "changelog",
								message: "Enter changelog message:",
								validate: (input) =>
									(typeof input === "string" && input.length > 0) ||
									"Changelog message is required",
							},
						]);
						changelog = answer.changelog as string;
					}

					const rule = await api.getRule(path);
					await api.updateRule(rule.id, {
						content,
						changelog,
					});

					// Update metadata
					existingRule.version = new Date().toISOString();
					if (metadata) {
						config.saveMetadata(metadata);
					}

					spinner.succeed(chalk.green(`Successfully pushed ${path}`));
				} else {
					spinner.fail(
						chalk.red(
							"Rule not found in metadata. Pull the rule first or use 'publish' for new rules.",
						),
					);
					process.exit(1);
				}
			} catch (error) {
				spinner.fail(chalk.red("Failed to push rule"));
				if (axios.isAxiosError(error)) {
					if (error.response?.status === 403) {
						console.error(chalk.red("Permission denied. You can only update your own rules."));
					} else {
						console.error(chalk.red(error.response?.data?.message || error.message));
					}
				} else {
					console.error(chalk.red("An unexpected error occurred"));
				}
				process.exit(1);
			}
		});
}
