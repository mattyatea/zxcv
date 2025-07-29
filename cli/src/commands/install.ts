import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { ConfigManager } from "../config";
import { ApiClient } from "../utils/api";
import { FileManager } from "../utils/file";

export function createInstallCommand(): Command {
	return new Command("install")
		.description("Install rules from remote server")
		.alias("i")
		.argument("[path]", "Rule path to install (@owner/rulename)")
		.option(
			"--frozen-lockfile",
			"Don't update metadata, install exactly what's specified",
		)
		.option("-f, --force", "Force install even if rule already exists")
		.action(
			async (
				path?: string,
				options?: { frozenLockfile?: boolean; force?: boolean },
			) => {
				const config = new ConfigManager();
				const api = new ApiClient(config);
				const fileManager = new FileManager(config);

				// If path is provided, install single rule
				if (path) {
					const spinner = ora("Installing rule...").start();

					try {
						// Parse path - must be @owner/rulename format
						if (!path.startsWith("@")) {
							throw new Error("Rule path must be in @owner/rulename format");
						}

						const pathParts = path.split("/");
						if (pathParts.length !== 2) {
							throw new Error("Rule path must be in @owner/rulename format");
						}

						const owner = pathParts[0].substring(1); // Remove @ prefix
						const ruleName = pathParts[1];

						if (!owner || !ruleName) {
							throw new Error("Invalid rule path format. Use @owner/rulename");
						}

						// Get rule from server
						spinner.text = "Fetching rule information...";
						const rule = await api.getRule(path);

						// Check if rule already exists
						const metadata = config.loadMetadata() || {
							version: "1.0.0",
							lastSync: new Date().toISOString(),
							rules: [],
						};

						const existingRule = metadata.rules.find(
							(r) => r.name === ruleName && r.owner === owner,
						);

						if (existingRule && !options?.force) {
							spinner.fail(
								chalk.yellow(
									`Rule already exists (version ${existingRule.version}). Use --force to overwrite.`,
								),
							);
							return;
						}

						// Get rule content
						spinner.text = `Downloading rule content (version ${rule.version})...`;
						const { content } = await api.getRuleContent(rule.id);

						// Save rule
						spinner.text = "Saving rule...";
						const pulledRule = fileManager.saveRule(rule, content);

						// Update metadata
						if (existingRule) {
							const index = metadata.rules.findIndex(
								(r) => r.name === ruleName && r.owner === owner,
							);
							metadata.rules[index] = pulledRule;
							if (existingRule.version !== pulledRule.version) {
								console.log(
									chalk.blue(
										`Updated from version ${existingRule.version} to ${pulledRule.version}`,
									),
								);
							}
						} else {
							metadata.rules.push(pulledRule);
						}

						metadata.lastSync = new Date().toISOString();
						config.saveMetadata(metadata);

						spinner.succeed(
							chalk.green(
								`Successfully installed ${path} (version ${pulledRule.version})`,
							),
						);
						console.log(
							chalk.gray(`Rule saved to: ${config.getSymlinkDir()}/${path}.md`),
						);
					} catch (error) {
						spinner.fail(chalk.red("Failed to install rule"));
						if (axios.isAxiosError(error)) {
							if (error.response?.status === 404) {
								const errorMessage =
									error.response?.data?.message || "Rule not found";
								if (
									errorMessage.includes("バージョンが見つかりません") ||
									errorMessage.includes("version")
								) {
									console.error(
										chalk.red(
											`Rule exists but no version information found for ${path}`,
										),
									);
									console.error(
										chalk.yellow(
											"This may be a legacy rule without proper versioning.",
										),
									);
								} else {
									console.error(chalk.red(`Rule not found: ${path}`));
								}
							} else if (error.response?.status === 401) {
								console.error(
									chalk.red("Authentication required. Please login first."),
								);
							} else {
								console.error(
									chalk.red(error.response?.data?.message || error.message),
								);
							}
						} else if (error instanceof Error) {
							console.error(chalk.red(error.message));
						} else {
							console.error(chalk.red("An unexpected error occurred"));
						}
						process.exit(1);
					}
				} else {
					// Install all rules from metadata
					const spinner = ora("Installing rules...").start();
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
							const path = `@${rule.owner || "unknown"}/${rule.name}`;
							spinner.text = `Installing ${path}...`;

							// Get rule from server
							const serverRule = await api.getRule(path);
							const { content } = await api.getRuleContent(serverRule.id);

							// Save rule
							fileManager.saveRule(serverRule, content);

							// Update version if not frozen
							if (!options?.frozenLockfile) {
								rule.version = serverRule.version;
								rule.pulledAt = new Date().toISOString();
							}

							installedCount++;
						} catch (error) {
							errorCount++;
							const path = `@${rule.owner || "unknown"}/${rule.name}`;

							if (axios.isAxiosError(error) && error.response?.status === 404) {
								console.error(chalk.red(`\n✗ Rule not found: ${path}`));
							} else {
								console.error(chalk.red(`\n✗ Failed to install ${path}`));
							}
						}
					}

					// Save updated metadata if not frozen
					if (!options?.frozenLockfile && installedCount > 0) {
						metadata.lastSync = new Date().toISOString();
						config.saveMetadata(metadata);
					}

					spinner.stop();

					if (installedCount > 0) {
						console.log(
							chalk.green(
								`\n✓ Installed ${installedCount} rule${installedCount > 1 ? "s" : ""}`,
							),
						);
					}

					if (errorCount > 0) {
						console.log(
							chalk.red(
								`\n✗ Failed to install ${errorCount} rule${errorCount > 1 ? "s" : ""}`,
							),
						);
						process.exit(1);
					}
				}
			},
		);
}
