import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { ConfigManager } from "../config";
import { ApiClient } from "../utils/api";

export function createSearchCommand(): Command {
	return new Command("search")
		.description("Search for rules on remote server")
		.argument("[query]", "Search query")
		.option("-t, --tags <tags>", "Filter by tags (comma-separated)")
		.option("-o, --owner <owner>", "Filter by owner")
		.option("-v, --visibility <visibility>", "Filter by visibility (public/private)")
		.option("-l, --limit <limit>", "Maximum number of results", "20")
		.action(
			async (
				query?: string,
				options?: { tags?: string; owner?: string; visibility?: string; limit?: string },
			) => {
				const spinner = ora("Searching rules...").start();
				const config = new ConfigManager();
				const api = new ApiClient(config);

				try {
					const searchParams: {
						limit: number;
						searchTerm?: string;
						tags?: string[];
						owner?: string;
						visibility?: "public" | "private";
						page?: number;
					} = {
						limit: Number.parseInt(options?.limit || "20"),
						page: 1, 
					};

					if (query) {
						searchParams.searchTerm = query;
					}

					if (options?.tags) {
						searchParams.tags = options.tags.split(",").map((t) => t.trim());
					}

					if (options?.owner) {
						searchParams.owner = options.owner;
					}

					if (options?.visibility) {
						if (options.visibility !== "public" && options.visibility !== "private") {
							spinner.fail(chalk.red("Invalid visibility. Must be 'public' or 'private'"));
							process.exit(1);
						}
						searchParams.visibility = options.visibility as "public" | "private";
					}

					const rules = await api.searchRules(searchParams);
					spinner.stop();

					if (rules.length === 0) {
						console.log(chalk.yellow("No rules found"));
						return;
					}

					console.log(chalk.bold(`\nFound ${rules.length} rules:`));
					console.log(chalk.gray("─".repeat(60)));

					for (const rule of rules) {
						let path = rule.name;
						if (rule.organization) {
							path = `@${rule.organization}/${rule.name}`;
						} else if (rule.owner) {
							path = `${rule.owner}/${rule.name}`;
						}

						console.log(chalk.cyan(path));
						if (rule.tags.length > 0) {
							console.log(chalk.gray(`  Tags: ${rule.tags.join(", ")}`));
						}
						console.log(chalk.gray(`  Visibility: ${rule.visibility}`));
						console.log(chalk.gray(`  Updated: ${new Date(rule.updatedAt).toLocaleString()}`));
						console.log();
					}

					console.log(chalk.gray("─".repeat(60)));
					console.log(chalk.gray(`Use 'zxcv pull <path>' to download a rule`));
				} catch (error) {
					spinner.fail(chalk.red("Search failed"));
					if (axios.isAxiosError(error)) {
						console.error(chalk.red(error.response?.data?.message || error.message));
					} else {
						console.error(chalk.red("An unexpected error occurred"));
					}
					process.exit(1);
				}
			},
		);
}
