import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import { ConfigManager } from "../config";
import { ApiClient } from "../utils/api";
import { FileManager } from "../utils/file";
import { promptGitIgnoreOnInstall } from "../utils/gitignore";
import { MemoryFileManager } from "../utils/memory-file";
import { promptMemoryFile } from "../utils/prompt";
import { ora } from "../utils/spinner.js";

export function createInstallCommand(): Command {
	return new Command("install")
		.description("Install rules from remote server")
		.alias("i")
		.argument("[path]", "Rule path to install (@owner/rulename)")
		.option("--frozen-lockfile", "Don't update metadata, install exactly what's specified")
		.option("-f, --force", "Force install even if rule already exists")
		.option("--file <path>", "Specify memory file to record the rule")
		.option("--no-warn", "Don't show warnings for non-project files")
		.action(
			async (
				path?: string,
				options?: { frozenLockfile?: boolean; force?: boolean; file?: string; noWarn?: boolean },
			) => {
				const config = new ConfigManager();
				const api = new ApiClient(config);
				const fileManager = new FileManager(config);
				const memoryManager = new MemoryFileManager(config);

				// If path is provided, install single rule
				if (path) {
					const spinner = ora("Installing rule...").start();

					try {
						// Parse path and version
						let packageName = path;
						let requestedVersion: string | undefined;

						// Check for version specification (e.g., @user/rule@1.0.0)
						const versionIndex = path.lastIndexOf("@");
						if (versionIndex > 0) {
							// Not the first @ in @org/rule
							packageName = path.substring(0, versionIndex);
							requestedVersion = path.substring(versionIndex + 1);
						}

						// Parse path - must be @owner/rulename format
						if (!packageName.startsWith("@")) {
							throw new Error("Rule path must be in @owner/rulename format");
						}

						const pathParts = packageName.split("/");
						if (pathParts.length !== 2) {
							throw new Error("Rule path must be in @owner/rulename format");
						}

						const owner = pathParts[0].substring(1); // Remove @ prefix
						const ruleName = pathParts[1];

						if (!owner || !ruleName) {
							throw new Error("Invalid rule path format. Use @owner/rulename");
						}

						// Get rule from server (use packageName without version)
						spinner.text("Fetching rule information...");
						const rule = await api.getRule(packageName);

						// Check if rule already exists
						const metadata = config.loadMetadata() || {
							version: "1.0.0",
							lastSync: new Date().toISOString(),
							rules: [],
						};

						// フルパス形式で比較
						const fullName = `@${owner}/${ruleName}`;
						const existingRule = metadata.rules.find((r) => r.name === fullName);

						if (existingRule && !options?.force) {
							spinner.fail(
								chalk.yellow(
									`Rule already exists (version ${existingRule.version}). Use --force to overwrite.`,
								),
							);
							return;
						}

						// Get rule content with specific version if requested
						const targetVersion = requestedVersion || rule.version;
						spinner.text(`Downloading rule content (version ${targetVersion})...`);
						const { content, version } = await api.getRuleContent(rule.id, requestedVersion);

						// Update rule object with the actual version from content response
						if (requestedVersion) {
							rule.version = version;
						}

						// Save rule
						spinner.text("Saving rule...");
						const pulledRule = fileManager.saveRule(rule, content);

						// Update metadata
						if (existingRule) {
							const index = metadata.rules.findIndex((r) => r.name === fullName);
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
							chalk.green(`Successfully installed ${packageName} (version ${pulledRule.version})`),
						);
						console.log(chalk.gray(`Rule saved to: ${config.getSymlinkDir()}/${packageName}.md`));

						// メモリファイルに記録
						spinner.stop();
						const recordingSpinner = ora("Recording to memory file...").start();

						try {
							let targetFile: string;
							let isFirstInstall = false;

							if (options?.file) {
								// ファイルが指定された場合
								targetFile = memoryManager.resolveFilePath(options.file);

								// プロジェクト外への保存の場合は警告
								if (!targetFile.startsWith(process.cwd()) && !options?.noWarn) {
									recordingSpinner.stop();
									console.log(
										chalk.yellow(
											"⚠️  警告: プロジェクト外のファイルに記録しようとしています\n" +
												"    推奨: プロジェクト内のCLAUDE.mdやCOPILOT.md等を使用\n" +
												"    続行しますか？（自己責任）",
										),
									);

									const { inquirer } = await import("../utils/prompt");
									const { confirm } = await inquirer.prompt([
										{
											type: "confirm",
											name: "confirm",
											message: "続行",
											default: false,
										},
									]);

									if (!confirm) {
										console.log(chalk.yellow("インストールはキャンセルされました"));
										return;
									}
									recordingSpinner.start();
								}
							} else {
								// 対話式で選択
								recordingSpinner.stop();
								targetFile = await promptMemoryFile(packageName);
								recordingSpinner.start();

								// 初回インストールかチェック（メモリファイルが存在しない場合）
								const { existsSync } = await import("node:fs");
								isFirstInstall = !existsSync(targetFile);
							}

							await memoryManager.addRule(targetFile, pulledRule);

							// Agents.mdの場合、CLAUDE.mdへのシンボリックリンクを作成
							const { basename } = await import("node:path");
							if (basename(targetFile) === "Agents.md") {
								memoryManager.createAgentsSymlink(targetFile);
							}

							// 表示用パスを取得
							const displayPath = memoryManager.getDisplayPath(targetFile);
							recordingSpinner.succeed(chalk.green(`✓ ${displayPath} に記録しました`));

							// 初回インストールの場合、gitignore設定を促す
							if (isFirstInstall) {
								recordingSpinner.stop();
								await promptGitIgnoreOnInstall(process.cwd());
							}
						} catch (error) {
							recordingSpinner.fail(chalk.red("Failed to record to memory file"));
							if (error instanceof Error) {
								console.error(chalk.red(error.message));
							}
						}
					} catch (error) {
						spinner.fail(chalk.red("Failed to install rule"));
						if (axios.isAxiosError(error)) {
							if (error.response?.status === 404) {
								const errorMessage = error.response?.data?.message || "Rule not found";
								if (
									errorMessage.includes("バージョンが見つかりません") ||
									errorMessage.includes("version")
								) {
									console.error(
										chalk.red(`Rule exists but no version information found for ${path}`),
									);
									console.error(
										chalk.yellow("This may be a legacy rule without proper versioning."),
									);
								} else {
									console.error(chalk.red(`Rule not found: ${path}`));
								}
							} else if (error.response?.status === 401) {
								console.error(chalk.red("Authentication required. Please login first."));
							} else {
								console.error(chalk.red(error.response?.data?.message || error.message));
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

					spinner.text(
						`Installing ${metadata.rules.length} rule${metadata.rules.length > 1 ? "s" : ""}...`,
					);

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

							// rule.name にはすでにフルパス形式が入っている
							const path = rule.name;
							spinner.text(`Installing ${path}...`);

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
							// rule.name にはすでにフルパス形式が入っている
							const path = rule.name;

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
							chalk.green(`\n✓ Installed ${installedCount} rule${installedCount > 1 ? "s" : ""}`),
						);
					}

					if (errorCount > 0) {
						console.log(
							chalk.red(`\n✗ Failed to install ${errorCount} rule${errorCount > 1 ? "s" : ""}`),
						);
						process.exit(1);
					}
				}
			},
		);
}
