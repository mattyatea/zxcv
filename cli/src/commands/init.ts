import { writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import type { ZxcvMetadata } from "../types";

export function createInitCommand(): Command {
	return new Command("init")
		.description("Initialize a new zxcv project")
		.option("-y, --yes", "Skip prompts and use defaults")
		.action(async (options: { yes?: boolean }) => {
			console.log(chalk.bold("\n🚀 Initializing zxcv project...\n"));

			let projectName = "my-project";
			let rulesDir = "rules";

			if (!options.yes) {
				const answers = await inquirer.prompt([
					{
						type: "input",
						name: "projectName",
						message: "Project name:",
						default: projectName,
					},
					{
						type: "input",
						name: "rulesDir",
						message: "Rules directory:",
						default: rulesDir,
					},
				]);

				projectName = answers.projectName;
				rulesDir = answers.rulesDir;
			}

			// Create zxcv-metadata.json
			const metadata: ZxcvMetadata = {
				version: "1.0.0",
				lastSync: new Date().toISOString(),
				rules: [],
			};

			const metadataPath = join(process.cwd(), "zxcv-metadata.json");
			writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

			// Create .zxcvrc.json if custom rules directory
			if (rulesDir !== "rules") {
				const configPath = join(process.cwd(), ".zxcvrc.json");
				writeFileSync(
					configPath,
					JSON.stringify(
						{
							rulesDir,
						},
						null,
						2,
					),
				);
			}

			console.log(chalk.green("\n✓ Initialized zxcv project"));
			console.log(chalk.gray("  Created: zxcv-metadata.json"));
			if (rulesDir !== "rules") {
				console.log(chalk.gray("  Created: .zxcvrc.json"));
			}
			console.log(
				chalk.gray(`\n  Run 'zxcv add <rule>' to add your first rule`),
			);
		});
}
