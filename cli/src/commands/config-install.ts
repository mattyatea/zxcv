import { existsSync, mkdirSync, mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import chalk from "chalk";
import { Command } from "commander";
import { ConfigManager } from "../config";
import { ApiClient } from "../utils/api";
import { inquirer } from "../utils/prompt.js";
import { ora } from "../utils/spinner.js";

function openInEditor(filePath: string): void {
	const editor =
		process.env.EDITOR || process.env.VISUAL || (process.platform === "win32" ? "notepad" : "vi");

	const result = spawnSync(editor, [filePath], { stdio: "inherit" });

	if (result.error) {
		throw result.error;
	}
}

function extractRulePath(target: string): string | null {
	if (target.startsWith("@")) {
		return target;
	}

	const match = target.match(/@[^/\s]+\/[A-Za-z0-9-_]+/);
	return match ? match[0] : null;
}

function resolveCodexConfigPath(): string {
	const home = process.env.HOME || tmpdir();
	return join(home, ".codex", "config.toml");
}

function ensureCodexDirectory(): void {
	const configFile = resolveCodexConfigPath();
	const dir = dirname(configFile);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
}

export function createConfigInstallCommand(): Command {
	return new Command("config-install")
		.description("Install a shared Codex configuration")
		.argument("<target>", "Rule path or URL to the shared configuration")
		.action(async (target: string) => {
			const path = extractRulePath(target);
			if (!path) {
				console.error(
					chalk.red(
						"Unable to determine shared configuration path. Provide @owner/name or a URL containing it.",
					),
				);
				process.exit(1);
			}

			const configManager = new ConfigManager();
			const api = new ApiClient(configManager);
			const spinner = ora("Fetching configuration metadata...");

			try {
				spinner.start();
				const rule = await api.getRule(path);

				if (rule.type !== "config") {
					spinner.fail(chalk.red("The provided resource is not a configuration."));
					process.exit(1);
				}

				if (rule.subType !== "codex") {
					spinner.fail(
						chalk.red(
							`This installer currently supports Codex configurations only. Received '${
								rule.subType ?? "unknown"
							}'.`,
						),
					);
					process.exit(1);
				}

				spinner.text("Downloading configuration content...");
				const { content } = await api.getRuleContent(rule.id);
				spinner.stop();

				console.log(chalk.blue("Codex configuration detected."));

				const confirmInstall = await inquirer.prompt([
					{
						type: "confirm",
						name: "proceed",
						message: "Install Codex configuration to ~/.codex/config.toml?",
						default: true,
					},
				]);

				if (!confirmInstall.proceed) {
					console.log(chalk.yellow("Installation cancelled"));
					return;
				}

				const tempDir = mkdtempSync(join(tmpdir(), "zxcv-config-review-"));
				const tempFile = join(tempDir, `codex-config-${Date.now()}.toml`);
				writeFileSync(tempFile, content, "utf-8");

				console.log(
					chalk.gray(
						`Review the configuration before installing (${process.env.EDITOR || process.env.VISUAL || (process.platform === "win32" ? "notepad" : "vi")}).`,
					),
				);

				openInEditor(tempFile);
				const reviewedContent = readFileSync(tempFile, "utf-8");

				const confirmWrite = await inquirer.prompt([
					{
						type: "confirm",
						name: "write",
						message: "Write reviewed configuration to ~/.codex/config.toml?",
						default: true,
					},
				]);

				if (!confirmWrite.write) {
					console.log(chalk.yellow("Installation cancelled"));
					return;
				}

				ensureCodexDirectory();
				writeFileSync(resolveCodexConfigPath(), reviewedContent, "utf-8");
				console.log(chalk.green("Codex configuration installed successfully."));
			} catch (error) {
				spinner.fail(chalk.red("Failed to install configuration"));
				if (error instanceof Error) {
					console.error(chalk.red(error.message));
				}
				process.exit(1);
			}
		});
}
