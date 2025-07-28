import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { ConfigManager } from "../config";
import type { ZxcvMetadata } from "../types";
import { ApiClient } from "../utils/api";
import { FileManager } from "../utils/file";

export function createAddCommand(): Command {
	return new Command("add")
		.description("Add rules to your project")
		.argument("<packages...>", "Rule packages to add (e.g., rulename or @org/rulename)")
		.option("-D, --save-dev", "Save as development dependency")
		.option("-E, --save-exact", "Save exact version")
		.option("-g, --global", "Install globally")
		.action(
			async (
				packages: string[],
				_options: { saveDev?: boolean; saveExact?: boolean; global?: boolean },
			) => {
				const spinner = ora("Adding rules...").start();
				const config = new ConfigManager();
				const api = new ApiClient(config);
				const fileManager = new FileManager(config);

				let successCount = 0;
				let errorCount = 0;

				for (const pkg of packages) {
					try {
						spinner.text = `Adding ${pkg}...`;

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
							throw new Error("Invalid rule path format");
						}

						// Get rule from server
						const rule = await api.getRule(pkg);

						// Check if rule already exists
						const metadata = config.loadMetadata() || {
							version: "1.0.0",
							lastSync: new Date().toISOString(),
							rules: [],
						};

						const existingRule = metadata.rules.find(
							(r) => r.name === ruleName && r.owner === owner && r.organization === organization,
						);

						if (existingRule) {
							spinner.info(chalk.yellow(`${pkg} is already added`));
							continue;
						}

						// Get rule content
						const { content } = await api.getRuleContent(rule.id);

						// Save rule
						const pulledRule = fileManager.saveRule(rule, content);

						// Update metadata
						metadata.rules.push(pulledRule);
						metadata.lastSync = new Date().toISOString();
						config.saveMetadata(metadata);

						successCount++;
					} catch (error) {
						errorCount++;
						if (axios.isAxiosError(error)) {
							if (error.response?.status === 404) {
								console.error(chalk.red(`\n✗ ${pkg} not found`));
							} else if (error.response?.status === 401) {
								console.error(chalk.red("\n✗ Authentication required. Please login first."));
								break;
							} else {
								console.error(
									chalk.red(
										`\n✗ Failed to add ${pkg}: ${error.response?.data?.message || error.message}`,
									),
								);
							}
						} else {
							console.error(chalk.red(`\n✗ Failed to add ${pkg}`));
						}
					}
				}

				spinner.stop();

				if (successCount > 0) {
					console.log(chalk.green(`\n✓ Added ${successCount} rule${successCount > 1 ? "s" : ""}`));
				}
				if (errorCount > 0) {
					console.log(
						chalk.red(`\n✗ Failed to add ${errorCount} rule${errorCount > 1 ? "s" : ""}`),
					);
					process.exit(1);
				}
			},
		);
}
