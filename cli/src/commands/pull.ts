import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { ConfigManager } from "../config";
import type { ZxcvMetadata } from "../types";
import { ApiClient } from "../utils/api";
import { FileManager } from "../utils/file";

export function createPullCommand(): Command {
	return new Command("pull")
		.description("Pull rules from remote server")
		.argument("<path>", "Rule path (e.g., rulename or @org/rulename)")
		.option("-f, --force", "Force pull even if rule already exists")
		.action(async (path: string, options: { force?: boolean }) => {
			const spinner = ora("Pulling rule...").start();
			const config = new ConfigManager();
			const api = new ApiClient(config);
			const fileManager = new FileManager(config);

			try {
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
					(r) => r.name === ruleName && r.owner === owner && r.organization === organization,
				);

				if (existingRule && !options.force) {
					spinner.fail(chalk.yellow("Rule already exists. Use --force to overwrite."));
					return;
				}

				// Get rule content
				spinner.text = "Downloading rule content...";
				const { content } = await api.getRuleContent(rule.id);

				// Save rule
				spinner.text = "Saving rule...";
				const pulledRule = fileManager.saveRule(rule, content);

				// Update metadata
				if (existingRule) {
					const index = metadata.rules.findIndex(
						(r) => r.name === ruleName && r.owner === owner && r.organization === organization,
					);
					metadata.rules[index] = pulledRule;
				} else {
					metadata.rules.push(pulledRule);
				}

				metadata.lastSync = new Date().toISOString();
				config.saveMetadata(metadata);

				spinner.succeed(chalk.green(`Successfully pulled ${path}`));
				console.log(chalk.gray(`Rule saved to: ${config.getSymlinkDir()}/${path}.md`));
			} catch (error) {
				spinner.fail(chalk.red("Failed to pull rule"));
				if (axios.isAxiosError(error)) {
					if (error.response?.status === 404) {
						console.error(chalk.red("Rule not found"));
					} else if (error.response?.status === 401) {
						console.error(chalk.red("Authentication required. Please login first."));
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
