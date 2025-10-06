import { describe, expect, it } from "vitest";
import {
	extractTemplateMetadata,
	getMissingVariables,
	hasTemplateVariables,
	isValidVariableName,
	parseTemplateVariables,
	renderTemplate,
} from "../src/utils/template";

describe("Template Engine", () => {
	describe("parseTemplateVariables", () => {
		it("should extract single variable", () => {
			const content = "Output in {{language}}";
			const variables = parseTemplateVariables(content);

			expect(variables).toHaveLength(1);
			expect(variables[0].name).toBe("language");
		});

		it("should extract multiple variables", () => {
			const content = "{{greeting}} in {{language}} for {{audience}}";
			const variables = parseTemplateVariables(content);

			expect(variables).toHaveLength(3);
			expect(variables.map((v) => v.name)).toContain("greeting");
			expect(variables.map((v) => v.name)).toContain("language");
			expect(variables.map((v) => v.name)).toContain("audience");
		});

		it("should handle duplicate variables", () => {
			const content = "{{language}} and {{language}} again";
			const variables = parseTemplateVariables(content);

			expect(variables).toHaveLength(1);
			expect(variables[0].name).toBe("language");
		});

		it("should return empty array for no variables", () => {
			const content = "No variables here";
			const variables = parseTemplateVariables(content);

			expect(variables).toHaveLength(0);
		});

		it("should handle variables with underscores and numbers", () => {
			const content = "{{var_1}} and {{var_2}}";
			const variables = parseTemplateVariables(content);

			expect(variables).toHaveLength(2);
			expect(variables.map((v) => v.name)).toContain("var_1");
			expect(variables.map((v) => v.name)).toContain("var_2");
		});
	});

	describe("hasTemplateVariables", () => {
		it("should return true for content with variables", () => {
			expect(hasTemplateVariables("Output in {{language}}")).toBe(true);
		});

		it("should return false for content without variables", () => {
			expect(hasTemplateVariables("No variables here")).toBe(false);
		});

		it("should return false for malformed variables", () => {
			expect(hasTemplateVariables("{ {language} }")).toBe(false);
		});
	});

	describe("renderTemplate", () => {
		it("should replace single variable", () => {
			const content = "Output in {{language}}";
			const result = renderTemplate(content, { language: "Japanese" });

			expect(result).toBe("Output in Japanese");
		});

		it("should replace multiple variables", () => {
			const content = "{{greeting}} in {{language}}";
			const result = renderTemplate(content, {
				greeting: "Hello",
				language: "English",
			});

			expect(result).toBe("Hello in English");
		});

		it("should replace all occurrences of same variable", () => {
			const content = "{{language}} and {{language}} again";
			const result = renderTemplate(content, { language: "Japanese" });

			expect(result).toBe("Japanese and Japanese again");
		});

		it("should leave unreplaced variables as is", () => {
			const content = "{{language}} and {{other}}";
			const result = renderTemplate(content, { language: "Japanese" });

			expect(result).toBe("Japanese and {{other}}");
		});

		it("should handle empty values", () => {
			const content = "Output in {{language}}";
			const result = renderTemplate(content, { language: "" });

			expect(result).toBe("Output in ");
		});
	});

	describe("getMissingVariables", () => {
		it("should return missing variables", () => {
			const content = "{{language}} and {{format}}";
			const missing = getMissingVariables(content, { language: "Japanese" });

			expect(missing).toHaveLength(1);
			expect(missing[0].name).toBe("format");
		});

		it("should return empty array when all provided", () => {
			const content = "{{language}}";
			const missing = getMissingVariables(content, { language: "Japanese" });

			expect(missing).toHaveLength(0);
		});

		it("should return all variables when none provided", () => {
			const content = "{{language}} and {{format}}";
			const missing = getMissingVariables(content, {});

			expect(missing).toHaveLength(2);
		});
	});

	describe("isValidVariableName", () => {
		it("should accept valid names", () => {
			expect(isValidVariableName("language")).toBe(true);
			expect(isValidVariableName("var_1")).toBe(true);
			expect(isValidVariableName("_private")).toBe(true);
			expect(isValidVariableName("camelCase")).toBe(true);
		});

		it("should reject invalid names", () => {
			expect(isValidVariableName("123var")).toBe(false);
			expect(isValidVariableName("var-name")).toBe(false);
			expect(isValidVariableName("var name")).toBe(false);
			expect(isValidVariableName("var.name")).toBe(false);
		});
	});

	describe("extractTemplateMetadata", () => {
		it("should extract single metadata", () => {
			const content = '<!-- template: language = "english" -->\nContent here';
			const metadata = extractTemplateMetadata(content);

			expect(metadata.language).toBe("english");
		});

		it("should extract multiple metadata", () => {
			const content = `<!-- template: language = "english" -->
<!-- template: format = "markdown" -->
Content here`;
			const metadata = extractTemplateMetadata(content);

			expect(metadata.language).toBe("english");
			expect(metadata.format).toBe("markdown");
		});

		it("should return empty object for no metadata", () => {
			const content = "No metadata here";
			const metadata = extractTemplateMetadata(content);

			expect(Object.keys(metadata)).toHaveLength(0);
		});
	});
});
