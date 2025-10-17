import { readFileSync } from "node:fs";
import { join } from "node:path";
import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import { ConfigManager } from "../config";
import { ApiClient } from "../utils/api";
import { FileManager } from "../utils/file";
import { inquirer } from "../utils/prompt.js";
import { ora } from "../utils/spinner.js";

export function createPublishCommand(): Command {
	return new Command("publish")
		.description("Publish a new rule to remote server")
		.argument("<file>", "Path to the markdown file to publish")
		.option("-n, --name <name>", "Rule name")
		.option("-v, --visibility <visibility>", "Rule visibility (public/private)", "public")
		.option("-t, --tags <tags>", "Comma-separated tags")
		.action(
			async (file: string, options: { name?: string; visibility?: string; tags?: string }) => {
				const spinner = ora("Publishing rule...").start();
				const config = new ConfigManager();
				const api = new ApiClient(config);
				const fileManager = new FileManager(config);

				try {
					// Check authentication
					if (!config.getAuthToken()) {
						spinner.fail(chalk.red("Authentication required. Please login first."));
						process.exit(1);
					}

					// Read file content
					spinner.text("Reading file...");
					let content: string;
					try {
						const filePath = join(process.cwd(), file);
						content = readFileSync(filePath, "utf-8");
					} catch (_error) {
						spinner.fail(chalk.red("Failed to read file"));
						process.exit(1);
					}

					// Get rule details
					let ruleName: string;
					if (options.name) {
						ruleName = options.name;
					} else {
						// Extract name from filename
						const pathParts = file.split("/");
						const filename = pathParts[pathParts.length - 1];
						const defaultName = filename.replace(/\.md$/, "");

						const answer = await inquirer.prompt([
							{
								type: "input",
								name: "name",
								message: "Rule name:",
								default: defaultName,
								validate: (input) =>
									(typeof input === "string" && /^[a-zA-Z0-9-_]+$/.test(input)) ||
									"Invalid rule name format",
							},
						]);
						ruleName = answer.name as string;
					}

					// Validate visibility
					const visibility = options.visibility as "public" | "private";
					if (visibility !== "public" && visibility !== "private") {
						spinner.fail(chalk.red("Invalid visibility. Must be 'public' or 'private'"));
						process.exit(1);
					}

					// Parse tags
					const tags = options.tags ? options.tags.split(",").map((t) => t.trim()) : [];

					// Create rule on server
					spinner.text("Creating rule on server...");
					const rule = await api.createRule({
						name: ruleName,
						content,
						visibility,
						tags,
					});

					// Save rule locally
					spinner.text("Saving rule locally...");
					const pulledRule = fileManager.saveRule(rule, content);

					// Update metadata
					const metadata = config.loadMetadata() || {
						version: "1.0.0",
						lastSync: new Date().toISOString(),
						rules: [],
					};

					metadata.rules.push(pulledRule);
					metadata.lastSync = new Date().toISOString();
					config.saveMetadata(metadata);

					spinner.succeed(chalk.green(`Successfully published ${ruleName}`));
					console.log(chalk.gray(`Rule ID: ${rule.id}`));
					console.log(chalk.gray(`Visibility: ${visibility}`));
					if (tags.length > 0) {
						console.log(chalk.gray(`Tags: ${tags.join(", ")}`));
					}
				} catch (error) {
					spinner.fail(chalk.red("Failed to publish rule"));
					if (axios.isAxiosError(error)) {
						if (error.response?.status === 409) {
							console.error(chalk.red("Rule with this name already exists"));
						} else {
							console.error(chalk.red(error.response?.data?.message || error.message));
						}
					} else {
						console.error(chalk.red("An unexpected error occurred"));
					}
					process.exit(1);
				}
			},
		);
}
