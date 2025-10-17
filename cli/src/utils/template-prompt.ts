import chalk from "chalk";
import { getMissingVariables, parseTemplateVariables, renderTemplate } from "./template";

export interface TemplatePromptOptions {
	[key: string]: string;
}

/**
 * Prompt user for template variables interactively
 */
export async function promptTemplateVariables(
	content: string,
	providedOptions: TemplatePromptOptions = {},
): Promise<TemplatePromptOptions> {
	const missingVars = getMissingVariables(content, providedOptions);

	if (missingVars.length === 0) {
		return providedOptions;
	}

	console.log(chalk.blue("\n📝 This rule contains template variables that need to be filled in:"));

	const { inquirer } = await import("./prompt");
	const values: TemplatePromptOptions = { ...providedOptions };

	try {
		for (const variable of missingVars) {
			const answer = await inquirer.prompt([
				{
					type: "input",
					name: "value",
					message: `What value for "${chalk.cyan(variable.name)}"?`,
					default: variable.defaultValue,
				},
			]);

			values[variable.name] = answer.value;
		}

		return values;
	} catch (error) {
		// Handle user cancellation (Ctrl+C)
		if (error instanceof Error && error.message.includes("User force closed")) {
			console.log(chalk.yellow("\n\nTemplate input cancelled by user"));
			throw new Error("Template input cancelled");
		}
		throw error;
	}
}

/**
 * Display template variables information
 */
export function displayTemplateInfo(content: string): void {
	const variables = parseTemplateVariables(content);

	if (variables.length === 0) {
		return;
	}

	console.log(chalk.blue("\n📝 Template variables detected:"));
	for (const variable of variables) {
		console.log(chalk.gray(`  - ${variable.name}`));
	}
}

/**
 * Process template content with CLI options and prompts
 */
export async function processTemplateContent(
	content: string,
	cliOptions: TemplatePromptOptions = {},
	interactive = true,
): Promise<string> {
	const variables = parseTemplateVariables(content);

	if (variables.length === 0) {
		return content;
	}

	let values = { ...cliOptions };

	// If interactive mode and there are missing variables, prompt user
	if (interactive) {
		values = await promptTemplateVariables(content, values);
	}

	return renderTemplate(content, values);
}

/**
 * Parse CLI options for template variables
 * Extracts all string options as potential template variables
 * Reserved options (like 'file', 'force', etc.) are excluded
 */
export function parseTemplateOptions(args: Record<string, unknown>): TemplatePromptOptions {
	const options: TemplatePromptOptions = {};

	// Reserved CLI options that should not be treated as template variables
	const reservedOptions = [
		"frozenLockfile",
		"force",
		"file",
		"noWarn",
		"template",
		"help",
		"version",
	];

	for (const [key, value] of Object.entries(args)) {
		// Skip reserved options and non-string values
		if (reservedOptions.includes(key) || typeof value !== "string") {
			continue;
		}

		// Any other string option is treated as a template variable
		options[key] = value;
	}

	return options;
}
