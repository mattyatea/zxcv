import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createAddCommand } from "../../src/commands/add";
import { ConfigManager } from "../../src/config";
import type { Rule, ZxcvMetadata } from "../../src/types";
import { TEST_CWD } from "../setup";

// Mock modules
mock.module("ora", () => ({
	default: mock(() => ({
		start: mock(() => ({
			text: "",
			stop: mock(),
			info: mock(),
			succeed: mock(),
			fail: mock(),
		})),
	})),
}));

mock.module("../../src/utils/api", () => ({
	ApiClient: mock(() => ({
		getRule: mock(),
		getRuleContent: mock(),
	})),
}));

mock.module("../../src/utils/file", () => ({
	FileManager: mock(() => ({
		saveRule: mock(),
	})),
}));

describe("add command", () => {
	let originalArgv: string[];
	let originalExit: typeof process.exit;

	beforeEach(() => {
		originalArgv = process.argv;
		originalExit = process.exit;
		process.chdir(TEST_CWD);

		// Mock process.exit
		process.exit = mock() as any;

		// Reset all mocks
		const { ApiClient } = require("../../src/utils/api");
		const { FileManager } = require("../../src/utils/file");
		ApiClient.mockReset();
		FileManager.mockReset();

		// Initialize metadata
		const metadata: ZxcvMetadata = {
			version: "1.0.0",
			lastSync: new Date().toISOString(),
			rules: [],
		};
		writeFileSync(
			join(TEST_CWD, "zxcv-metadata.json"),
			JSON.stringify(metadata, null, 2),
		);
	});

	afterEach(() => {
		process.argv = originalArgv;
		process.exit = originalExit;
	});

	test("should add a single rule successfully", async () => {
		const { ApiClient } = require("../../src/utils/api");
		const { FileManager } = require("../../src/utils/file");

		const mockRule: Rule = {
			id: "test-rule-id",
			name: "test-rule",
			content: "# Test Rule",
			visibility: "public",
			tags: ["test"],
			version: "1.0.0",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		};

		const mockContent = "# Test Rule Content";

		ApiClient.mockImplementation(() => ({
			getRule: mock(() => Promise.resolve(mockRule)),
			getRuleContent: mock(() => Promise.resolve({ content: mockContent })),
		}));

		FileManager.mockImplementation(() => ({
			saveRule: mock(() => ({
				name: "test-rule",
				path: "test-rule-id",
				version: "1.0.0",
				pulledAt: new Date().toISOString(),
			})),
		}));

		const command = createAddCommand();
		process.argv = ["node", "zxcv", "test-rule"];

		await new Promise<void>((resolve) => {
			command.parse(process.argv);
			setTimeout(resolve, 200);
		});

		// Check metadata was updated
		const metadata: ZxcvMetadata = JSON.parse(
			readFileSync(join(TEST_CWD, "zxcv-metadata.json"), "utf-8"),
		);
		expect(metadata.rules).toHaveLength(1);
		expect(metadata.rules[0].name).toBe("test-rule");
	});

	test("should handle rule not found error", async () => {
		const { ApiClient } = require("../../src/utils/api");

		const error = {
			isAxiosError: true,
			response: {
				status: 404,
				data: { message: "Rule not found" },
			},
		};

		ApiClient.mockImplementation(() => ({
			getRule: mock(() => Promise.reject(error)),
		}));

		const command = createAddCommand();
		process.argv = ["node", "zxcv", "non-existent"];

		await new Promise<void>((resolve) => {
			command.parse(process.argv);
			setTimeout(resolve, 200);
		});

		// Check process.exit was called
		expect(process.exit).toHaveBeenCalledWith(1);
	});

	test("should skip already added rules", async () => {
		// Add existing rule to metadata
		const existingMetadata: ZxcvMetadata = {
			version: "1.0.0",
			lastSync: new Date().toISOString(),
			rules: [
				{
					name: "existing-rule",
					path: "existing-id",
					version: "1.0.0",
					pulledAt: new Date().toISOString(),
				},
			],
		};
		writeFileSync(
			join(TEST_CWD, "zxcv-metadata.json"),
			JSON.stringify(existingMetadata, null, 2),
		);

		const { ApiClient } = require("../../src/utils/api");

		const mockRule: Rule = {
			id: "existing-id",
			name: "existing-rule",
			content: "# Existing",
			visibility: "public",
			tags: [],
			version: "1.0.0",
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		};

		ApiClient.mockImplementation(() => ({
			getRule: mock(() => Promise.resolve(mockRule)),
		}));

		const command = createAddCommand();
		process.argv = ["node", "zxcv", "existing-rule"];

		await new Promise<void>((resolve) => {
			command.parse(process.argv);
			setTimeout(resolve, 200);
		});

		// Metadata should remain unchanged
		const metadata: ZxcvMetadata = JSON.parse(
			readFileSync(join(TEST_CWD, "zxcv-metadata.json"), "utf-8"),
		);
		expect(metadata.rules).toHaveLength(1);
	});

	test("should add multiple rules", async () => {
		// Fresh metadata for this test
		const freshMetadata: ZxcvMetadata = {
			version: "1.0.0",
			lastSync: new Date().toISOString(),
			rules: [],
		};
		writeFileSync(
			join(TEST_CWD, "zxcv-metadata.json"),
			JSON.stringify(freshMetadata, null, 2),
		);

		const { ApiClient } = require("../../src/utils/api");
		const { FileManager } = require("../../src/utils/file");

		const rules = ["rule1", "rule2", "rule3"];

		ApiClient.mockImplementation(() => ({
			getRule: mock((path: string) => {
				return Promise.resolve({
					id: `${path}-id`,
					name: path,
					content: `# ${path}`,
					visibility: "public",
					tags: [],
					version: "1.0.0",
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				});
			}),
			getRuleContent: mock(() => Promise.resolve({ content: "# Content" })),
		}));

		FileManager.mockImplementation(() => ({
			saveRule: mock((rule: Rule) => ({
				name: rule.name,
				path: rule.id,
				version: rule.version,
				pulledAt: new Date().toISOString(),
			})),
		}));

		const command = createAddCommand();
		process.argv = ["node", "zxcv", ...rules];

		await new Promise<void>((resolve) => {
			command.parse(process.argv);
			setTimeout(resolve, 200);
		});

		// Check all rules were added
		const metadata: ZxcvMetadata = JSON.parse(
			readFileSync(join(TEST_CWD, "zxcv-metadata.json"), "utf-8"),
		);

		expect(metadata.rules).toHaveLength(3);
		expect(metadata.rules.map((r) => r.name)).toEqual(rules);
	});

	test("should add rules with organization scope", async () => {
		const freshMetadata: ZxcvMetadata = {
			version: "1.0.0",
			lastSync: new Date().toISOString(),
			rules: [],
		};
		writeFileSync(
			join(TEST_CWD, "zxcv-metadata.json"),
			JSON.stringify(freshMetadata, null, 2),
		);

		const { ApiClient } = require("../../src/utils/api");
		const { FileManager } = require("../../src/utils/file");

		ApiClient.mockImplementation(() => ({
			getRule: mock(() =>
				Promise.resolve({
					id: "org-rule-id",
					name: "test-rule",
					organization: "myorg",
					content: "# Org Rule",
					visibility: "public",
					tags: [],
					version: "1.0.0",
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				}),
			),
			getRuleContent: mock(() => Promise.resolve({ content: "# Content" })),
		}));

		FileManager.mockImplementation(() => ({
			saveRule: mock((rule: Rule) => ({
				name: `@${rule.organization}/${rule.name}`,
				path: rule.id,
				version: rule.version,
				pulledAt: new Date().toISOString(),
			})),
		}));

		const command = createAddCommand();
		process.argv = ["node", "zxcv", "@myorg/test-rule"];

		await new Promise<void>((resolve) => {
			command.parse(process.argv);
			setTimeout(resolve, 200);
		});

		const metadata: ZxcvMetadata = JSON.parse(
			readFileSync(join(TEST_CWD, "zxcv-metadata.json"), "utf-8"),
		);

		expect(metadata.rules).toHaveLength(1);
		expect(metadata.rules[0].name).toBe("@myorg/test-rule");
	});

	test("should add rules with user scope", async () => {
		const freshMetadata: ZxcvMetadata = {
			version: "1.0.0",
			lastSync: new Date().toISOString(),
			rules: [],
		};
		writeFileSync(
			join(TEST_CWD, "zxcv-metadata.json"),
			JSON.stringify(freshMetadata, null, 2),
		);

		const { ApiClient } = require("../../src/utils/api");
		const { FileManager } = require("../../src/utils/file");

		ApiClient.mockImplementation(() => ({
			getRule: mock(() =>
				Promise.resolve({
					id: "user-rule-id",
					name: "test-rule",
					owner: "testuser",
					content: "# User Rule",
					visibility: "public",
					tags: [],
					version: "1.0.0",
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				}),
			),
			getRuleContent: mock(() => Promise.resolve({ content: "# Content" })),
		}));

		FileManager.mockImplementation(() => ({
			saveRule: mock((rule: Rule) => ({
				name: `${rule.owner}/${rule.name}`,
				path: rule.id,
				version: rule.version,
				pulledAt: new Date().toISOString(),
			})),
		}));

		const command = createAddCommand();
		process.argv = ["node", "zxcv", "testuser/test-rule"];

		await new Promise<void>((resolve) => {
			command.parse(process.argv);
			setTimeout(resolve, 200);
		});

		const metadata: ZxcvMetadata = JSON.parse(
			readFileSync(join(TEST_CWD, "zxcv-metadata.json"), "utf-8"),
		);

		expect(metadata.rules).toHaveLength(1);
		expect(metadata.rules[0].name).toBe("testuser/test-rule");
	});
});
