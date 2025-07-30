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
		.argument("<packages...>", "Rule packages to add (e.g., @user/rule or @user/rule@1.0.0)")
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

						// Parse package path and version
						let packageName = pkg;
						let requestedVersion: string | undefined;

						// Check for version specification (e.g., @user/rule@1.0.0)
						const versionIndex = pkg.lastIndexOf("@");
						if (versionIndex > 0) {
							// Not the first @ in @org/rule
							packageName = pkg.substring(0, versionIndex);
							requestedVersion = pkg.substring(versionIndex + 1);
						}

						// Parse package path
						const pathParts = packageName.split("/");
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

						// Get rule from server (without version in path)
						const rule = await api.getRule(packageName);

						// Check if rule already exists
						const metadata = config.loadMetadata() || {
							version: "1.0.0",
							lastSync: new Date().toISOString(),
							rules: [],
						};

						// フルパス形式で比較（すべて@プレフィックス付き）
						// APIから取得したルールデータを優先
						let fullName: string;
						if (rule.organization) {
							fullName = `@${rule.organization}/${rule.name}`;
						} else if (rule.user?.username) {
							fullName = `@${rule.user.username}/${rule.name}`;
						} else if (rule.owner) {
							fullName = `@${rule.owner}/${rule.name}`;
						} else {
							// パッケージ名から推測
							fullName = organization
								? `@${organization}/${ruleName}`
								: owner
									? `@${owner}/${ruleName}`
									: ruleName;
						}

						const existingRule = metadata.rules.find((r) => r.name === fullName);

						if (existingRule) {
							// Check if specific version was requested
							if (requestedVersion && existingRule.version !== requestedVersion) {
								spinner.info(
									chalk.yellow(
										`${packageName} version ${existingRule.version} is installed. Updating to ${requestedVersion}...`,
									),
								);
							} else {
								spinner.info(chalk.yellow(`${packageName} is already added`));
								continue;
							}
						}

						// Get rule content with specific version if requested
						const { content, version } = await api.getRuleContent(rule.id, requestedVersion);

						// Update rule object with the actual version from content response
						if (requestedVersion) {
							rule.version = version;
						}

						// Save rule
						const pulledRule = fileManager.saveRule(rule, content);

						// Update metadata
						if (existingRule) {
							// Update existing rule
							const index = metadata.rules.findIndex((r) => r.name === fullName);
							metadata.rules[index] = pulledRule;
						} else {
							// Add new rule
							metadata.rules.push(pulledRule);
						}
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
