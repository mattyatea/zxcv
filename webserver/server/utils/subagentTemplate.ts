/**
 * Claude Subagent用のテンプレート生成ユーティリティ
 */

interface SubagentTemplateOptions {
	name: string;
	description: string;
	type:
		| "general"
		| "code-reviewer"
		| "test-generator"
		| "documentation"
		| "custom";
	capabilities?: string[];
	tools?: string[];
	language?: string;
}

/**
 * Subagentテンプレートを生成
 */
export function generateSubagentTemplate(
	options: SubagentTemplateOptions,
): string {
	const {
		name,
		description,
		type,
		capabilities = [],
		tools = [],
		language = "en",
	} = options;

	// 基本テンプレート
	let template = `# ${name}

${description}

## Type
${type}

## Capabilities
${capabilities.length > 0 ? capabilities.map((cap) => `- ${cap}`).join("\n") : "- General task processing"}

## Tools
${tools.length > 0 ? tools.map((tool) => `- ${tool}`).join("\n") : "- All available tools"}

## Instructions
`;

	// タイプ別の指示を追加
	switch (type) {
		case "code-reviewer":
			template += `
This agent specializes in code review and quality assessment.

### Primary Responsibilities:
1. Review code for best practices and patterns
2. Identify potential bugs and security issues
3. Suggest performance improvements
4. Check code consistency and style
5. Validate test coverage

### Review Process:
1. Analyze the code structure and architecture
2. Check for common anti-patterns
3. Verify error handling and edge cases
4. Assess code readability and maintainability
5. Provide constructive feedback with examples

### Output Format:
- Summary of findings
- Categorized issues (Critical, Major, Minor)
- Specific line-by-line suggestions
- Overall code quality score
`;
			break;

		case "test-generator":
			template += `
This agent specializes in generating comprehensive test suites.

### Primary Responsibilities:
1. Generate unit tests for functions and methods
2. Create integration tests for APIs
3. Design edge case scenarios
4. Generate test data and fixtures
5. Ensure adequate test coverage

### Test Generation Process:
1. Analyze code functionality and dependencies
2. Identify critical paths and edge cases
3. Generate appropriate test cases
4. Create mock data and stubs as needed
5. Validate test completeness

### Output Format:
- Complete test files with proper imports
- Descriptive test names and documentation
- Setup and teardown procedures
- Coverage report expectations
`;
			break;

		case "documentation":
			template += `
This agent specializes in creating and maintaining documentation.

### Primary Responsibilities:
1. Generate API documentation
2. Create user guides and tutorials
3. Write code comments and docstrings
4. Maintain README files
5. Create architectural documentation

### Documentation Process:
1. Analyze code structure and functionality
2. Extract key concepts and patterns
3. Generate clear and concise descriptions
4. Include usage examples and code snippets
5. Maintain consistency across documentation

### Output Format:
- Structured markdown documentation
- Clear section headings
- Code examples with syntax highlighting
- Cross-references and links
- Table of contents for longer documents
`;
			break;

		default:
			template += `
This is a general-purpose agent for various development tasks.

### Primary Responsibilities:
1. Assist with code implementation
2. Debug and troubleshoot issues
3. Refactor and optimize code
4. Answer technical questions
5. Provide development guidance

### Working Process:
1. Understand the task requirements
2. Analyze existing code and context
3. Implement or suggest solutions
4. Validate the implementation
5. Document changes and rationale

### Best Practices:
- Follow project conventions and style guides
- Prioritize code readability and maintainability
- Consider performance implications
- Ensure proper error handling
- Write self-documenting code
`;
	}

	// 共通のフッターを追加
	template += `

## Usage Examples

\`\`\`markdown
User: "Review this authentication implementation for security issues"
Agent: *Performs comprehensive security review focusing on authentication patterns*

User: "Generate tests for the UserService class"
Agent: *Creates unit tests covering all public methods and edge cases*

User: "Document this API endpoint"
Agent: *Generates OpenAPI specification and usage documentation*
\`\`\`

## Notes
- This agent follows Claude Code best practices
- Responses are optimized for the specific task type
- Always maintains code quality and consistency
`;

	return template;
}

/**
 * Subagentテンプレートのバリデーション
 */
export function validateSubagentContent(content: string): {
	isValid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	// 必須セクションのチェック
	const requiredSections = [
		"#",
		"## Type",
		"## Capabilities",
		"## Instructions",
	];
	for (const section of requiredSections) {
		if (!content.includes(section)) {
			errors.push(`Missing required section: ${section}`);
		}
	}

	// 最小文字数チェック
	if (content.length < 100) {
		errors.push(
			"Content is too short. Subagent definitions should be at least 100 characters.",
		);
	}

	// 最大文字数チェック
	if (content.length > 50000) {
		warnings.push(
			"Content is very long. Consider splitting into multiple agents.",
		);
	}

	// Markdownフォーマットの基本チェック
	const lines = content.split("\n");
	let hasTitle = false;
	for (const line of lines) {
		if (line.startsWith("# ")) {
			hasTitle = true;
			break;
		}
	}
	if (!hasTitle) {
		errors.push("Missing main title. Start with '# Agent Name'");
	}

	// 推奨セクションのチェック
	const recommendedSections = ["## Tools", "## Usage Examples", "## Notes"];
	for (const section of recommendedSections) {
		if (!content.includes(section)) {
			warnings.push(`Consider adding section: ${section}`);
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * サンプルSubagentテンプレートを取得
 */
export function getSampleSubagentTemplates(): Record<
	string,
	SubagentTemplateOptions
> {
	return {
		codeReviewer: {
			name: "Code Review Expert",
			description:
				"An expert agent for comprehensive code review and quality assessment",
			type: "code-reviewer",
			capabilities: [
				"Security vulnerability detection",
				"Performance analysis",
				"Code style validation",
				"Best practices enforcement",
				"Dependency analysis",
			],
			tools: ["Read", "Grep", "Task"],
		},
		testGenerator: {
			name: "Test Suite Generator",
			description: "Generates comprehensive test suites for your codebase",
			type: "test-generator",
			capabilities: [
				"Unit test generation",
				"Integration test creation",
				"E2E test scenarios",
				"Test data generation",
				"Coverage analysis",
			],
			tools: ["Read", "Write", "MultiEdit"],
		},
		docWriter: {
			name: "Documentation Specialist",
			description: "Creates and maintains high-quality technical documentation",
			type: "documentation",
			capabilities: [
				"API documentation",
				"User guides",
				"Code comments",
				"Architecture docs",
				"Tutorial creation",
			],
			tools: ["Read", "Write", "Grep"],
		},
		generalHelper: {
			name: "Development Assistant",
			description: "A versatile assistant for various development tasks",
			type: "general",
			capabilities: [
				"Code implementation",
				"Bug fixing",
				"Refactoring",
				"Performance optimization",
				"Technical guidance",
			],
			tools: ["*"], // All tools
		},
	};
}
