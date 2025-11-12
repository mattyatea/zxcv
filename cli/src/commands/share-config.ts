import axios from "axios";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import chalk from "chalk";
import { Command } from "commander";
import { ConfigManager } from "../config";
import type { Rule } from "../types";
import { ApiClient } from "../utils/api";
import { inquirer } from "../utils/prompt.js";
import { ora } from "../utils/spinner.js";

const SUPPORTED_CONFIGS = ["codex"] as const;

function maskSensitiveValues(content: string): string {
	const sensitiveKeys = /(token|secret|password|apiKey|apikey|key|bearer)/i;

	return content
		.split("\n")
		.map((line) => {
			const trimmed = line.trim();
			if (trimmed.startsWith("#") || !trimmed.includes("=")) {
				return line;
			}

			const [rawKey, ...rawValueParts] = line.split("=");
			const key = rawKey.trim().replace(/^"|"$/g, "");

			if (sensitiveKeys.test(key) && rawValueParts.length > 0) {
				const valuePart = rawValueParts.join("=").trim();
				const quote = valuePart.startsWith('"') ? '"' : valuePart.startsWith("'") ? "'" : "";
				const maskedValue = quote ? `${quote}REDACTED${quote}` : "REDACTED";
				return `${rawKey} = ${maskedValue}`;
			}

			return line;
		})
		.join("\n");
}

function openInEditor(filePath: string): void {
	const editor =
		process.env.EDITOR || process.env.VISUAL || (process.platform === "win32" ? "notepad" : "vi");

	const result = spawnSync(editor, [filePath], { stdio: "inherit" });

	if (result.error) {
		throw result.error;
	}
}

function resolveCodexConfigPath(): string {
	const home = process.env.HOME || tmpdir();
	return join(home, ".codex", "config.toml");
}

export function createShareConfigCommand(): Command {
	return new Command("share-config")
		.description("Share a sanitized Codex configuration")
		.argument("<configType>", "Configuration type to share (e.g. codex)")
		.action(async (configType: string) => {
			if (!SUPPORTED_CONFIGS.includes(configType as (typeof SUPPORTED_CONFIGS)[number])) {
				console.error(
					chalk.red(
						`Unsupported configuration type '${configType}'. Currently supported: ${SUPPORTED_CONFIGS.join(", ")}`,
					),
				);
				process.exit(1);
			}

			const configPath = resolveCodexConfigPath();
			if (!existsSync(configPath)) {
				console.error(
					chalk.red(
						`Codex configuration not found at ${configPath}. Ensure Codex is installed and configured before sharing.`,
					),
				);
				process.exit(1);
			}

			const spinner = ora("Preparing configuration...");
			spinner.start();

			const originalContent = readFileSync(configPath, "utf-8");
			const maskedContent = maskSensitiveValues(originalContent);

			const configManager = new ConfigManager();
			if (!configManager.getAuthToken()) {
				spinner.fail(chalk.red("Authentication required. Please login first."));
				process.exit(1);
			}

			const api = new ApiClient(configManager);

			try {
				const currentUser = await api.getCurrentUser();
				spinner.stop();

				const visibilityAnswer = await inquirer.prompt([
					{
						type: "list",
						name: "visibility",
						message: "Select visibility for this configuration",
						choices: [
							{ name: "Public", value: "public" },
							{ name: "Private", value: "private" },
							{ name: "Private (Org)", value: "organization" },
						],
						default: "private",
					},
				]);

				let organizationId: string | undefined;
				let organizationName: string | undefined;

				if (visibilityAnswer.visibility === "organization") {
					spinner.start("Fetching organizations...");
					const organizations = await api.listOrganizations();
					spinner.stop();

					if (!organizations.length) {
						console.error(
							chalk.red(
								"You do not belong to any organizations. Invite yourself to an organization before sharing privately.",
							),
						);
						process.exit(1);
					}

					const orgAnswer = await inquirer.prompt([
						{
							type: "list",
							name: "organizationId",
							message: "Select organization to share with",
							choices: organizations.map((org) => ({
								name: `${org.displayName} (@${org.name})`,
								value: org.id,
								short: org.name,
							})),
						},
					]);

					organizationId = orgAnswer.organizationId as string;
					organizationName =
						organizations.find((org) => org.id === organizationId)?.name ?? undefined;
				}

				const defaultName = `${configType}-config`;
				const answers = await inquirer.prompt([
					{
						type: "input",
						name: "name",
						message: "Configuration name",
						default: defaultName,
						validate: (input: string) =>
							(/^[a-zA-Z0-9-_]+$/.test(input) && input.length > 0) ||
							"Use only letters, numbers, dashes, and underscores",
					},
				]);

				const tempDir = mkdtempSync(join(tmpdir(), "zxcv-config-"));
				const tempFile = join(tempDir, `${answers.name}.toml`);
				writeFileSync(tempFile, maskedContent, "utf-8");

				console.log(
					chalk.gray(
						`Opening ${tempFile} in your editor (${process.env.EDITOR || process.env.VISUAL || (process.platform === "win32" ? "notepad" : "vi")})`,
					),
				);

				openInEditor(tempFile);
				const reviewedContent = readFileSync(tempFile, "utf-8");

				const confirm = await inquirer.prompt([
					{
						type: "confirm",
						name: "proceed",
						message: "Share this configuration?",
						default: true,
					},
				]);

				if (!confirm.proceed) {
					console.log(chalk.yellow("Share cancelled"));
					return;
				}

				spinner.start("Uploading configuration...");

				const tags = ["config", configType];
				const visibility = visibilityAnswer.visibility as "public" | "private" | "organization";

				const fullPath = organizationName
					? `@${organizationName}/${answers.name}`
					: `@${currentUser.username}/${answers.name}`;

				let existingRule: Rule | null = null;
				try {
					existingRule = await api.getRule(fullPath);
				} catch (error) {
					if (axios.isAxiosError(error) && error.response?.status === 404) {
						existingRule = null;
					} else {
						throw error;
					}
				}

				const existingOrganizationId = existingRule
					? typeof existingRule.organization === "string"
						? existingRule.organization
						: existingRule.organization &&
								typeof existingRule.organization === "object" &&
								"id" in existingRule.organization
							? (existingRule.organization as { id?: string }).id
							: undefined
					: undefined;

				const organizationSlug = organizationName
					? organizationName
					: existingRule &&
							existingRule.organization &&
							typeof existingRule.organization === "object" &&
							"name" in existingRule.organization
						? ((existingRule.organization as { name?: string }).name ?? undefined)
						: typeof existingRule?.organization === "string"
							? existingRule.organization
							: undefined;

				const targetOrganizationId =
					organizationId !== undefined && organizationId !== null
						? organizationId
						: existingOrganizationId;

				if (existingRule) {
					await api.updateRule(existingRule.id, {
						content: reviewedContent,
						tags,
						visibility,
						type: "config",
						subType: configType,
						organizationId: targetOrganizationId === undefined ? undefined : targetOrganizationId,
						changelog: "Updated shared configuration",
					});
					spinner.succeed(chalk.green("Configuration updated successfully"));
				} else {
					await api.createRule({
						name: answers.name as string,
						content: reviewedContent,
						visibility,
						tags,
						type: "config",
						subType: configType,
						organizationId,
					});
					spinner.succeed(chalk.green("Configuration shared successfully"));
				}

				console.log(
					chalk.gray(
						`Share path: ${organizationSlug ? `@${organizationSlug}` : `@${currentUser.username}`}/${answers.name}`,
					),
				);
			} catch (error) {
				spinner.fail(chalk.red("Failed to share configuration"));
				if (error instanceof Error) {
					console.error(chalk.red(error.message));
				}
				process.exit(1);
			}
		});
}
