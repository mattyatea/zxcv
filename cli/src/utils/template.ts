/**
 * Template engine for rule content
 * Supports {{variable}} syntax for dynamic content replacement
 */

export interface TemplateVariable {
	name: string;
	defaultValue?: string;
	description?: string;
}

export interface TemplateRenderOptions {
	[key: string]: string;
}

/**
 * Parse template variables from content
 * Extracts all {{variable}} occurrences
 */
export function parseTemplateVariables(content: string): TemplateVariable[] {
	const regex = /\{\{(\w+)\}\}/g;
	const variables = new Set<string>();
	let match: RegExpExecArray | null = regex.exec(content);

	while (match !== null) {
		if (match[1]) {
			variables.add(match[1]);
		}
		match = regex.exec(content);
	}

	return Array.from(variables).map((name) => ({
		name,
	}));
}

/**
 * Check if content contains template variables
 */
export function hasTemplateVariables(content: string): boolean {
	return /\{\{\w+\}\}/.test(content);
}

/**
 * Escape special regex characters to prevent ReDoS attacks
 */
function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Render template with provided values
 */
export function renderTemplate(content: string, values: TemplateRenderOptions): string {
	let rendered = content;

	for (const [key, value] of Object.entries(values)) {
		// Validate variable name before processing
		if (!isValidVariableName(key)) {
			console.warn(`Invalid variable name: ${key}, skipping`);
			continue;
		}

		// Escape special regex characters to prevent ReDoS
		const escapedKey = escapeRegex(key);
		const regex = new RegExp(`\\{\\{${escapedKey}\\}\\}`, "g");

		// Escape $ in replacement string (JavaScript replace treats $ specially)
		const escapedValue = value.replace(/\$/g, "$$$$");
		rendered = rendered.replace(regex, escapedValue);
	}

	return rendered;
}

/**
 * Get missing template variables (variables without values)
 */
export function getMissingVariables(
	content: string,
	providedValues: TemplateRenderOptions,
): TemplateVariable[] {
	const allVariables = parseTemplateVariables(content);
	return allVariables.filter((v) => !(v.name in providedValues));
}

/**
 * Validate template variable name
 */
export function isValidVariableName(name: string): boolean {
	return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Extract template metadata from content
 * Looks for special comments like: <!-- template: language = "english" -->
 */
export function extractTemplateMetadata(content: string): Record<string, string> {
	const metadata: Record<string, string> = {};
	const regex = /<!--\s*template:\s*(\w+)\s*=\s*"([^"]+)"\s*-->/g;
	let match: RegExpExecArray | null = regex.exec(content);

	while (match !== null) {
		if (match[1] && match[2]) {
			metadata[match[1]] = match[2];
		}
		match = regex.exec(content);
	}

	return metadata;
}
