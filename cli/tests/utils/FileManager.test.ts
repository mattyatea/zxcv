import { beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, readlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ConfigManager } from "../../src/config";
import type { PulledRule, Rule } from "../../src/types";
import { FileManager } from "../../src/utils/file";
import { TEST_CWD } from "../setup";

describe("FileManager", () => {
	let config: ConfigManager;
	let fileManager: FileManager;

	beforeEach(() => {
		process.chdir(TEST_CWD);
		config = new ConfigManager();
		fileManager = new FileManager(config);
	});

	test("should save rule and create symlink", () => {
		const rule: Rule = {
			id: "test-id",
			name: "test-rule",
			content: "# Test Rule Content",
			visibility: "public",
			tags: ["test"],
			version: "1.0.0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const content = "# Test Rule\n\nThis is a test rule.";
		const pulledRule = fileManager.saveRule(rule, content);

		// Check if rule file is saved
		const rulePath = join(config.getRulesDir(), "test-rule.md");
		expect(existsSync(rulePath)).toBe(true);
		expect(readFileSync(rulePath, "utf-8")).toBe(content);

		// Check if symlink is created
		const symlinkPath = join(config.getSymlinkDir(), "test-rule.md");
		expect(existsSync(symlinkPath)).toBe(true);

		// Check pulled rule data
		expect(pulledRule.name).toBe("test-rule");
		expect(pulledRule.version).toBe("1.0.0");
	});

	test("should save organization rule with proper directory structure", () => {
		const rule: Rule = {
			id: "org-rule-id",
			name: "org-rule",
			content: "# Org Rule",
			visibility: "public",
			organization: "myorg",
			tags: [],
			version: "1.0.0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const content = "# Organization Rule";
		const pulledRule = fileManager.saveRule(rule, content);

		// Check pulled rule has full path name
		expect(pulledRule.name).toBe("@myorg/org-rule");

		// Check file path
		const rulePath = join(config.getRulesDir(), "@myorg", "org-rule.md");
		expect(existsSync(rulePath)).toBe(true);

		// Check symlink path
		const symlinkPath = join(config.getSymlinkDir(), "@myorg", "org-rule.md");
		expect(existsSync(symlinkPath)).toBe(true);
	});

	test("should save user rule with proper directory structure", () => {
		const rule: Rule = {
			id: "user-rule-id",
			name: "user-rule",
			content: "# User Rule",
			visibility: "public",
			owner: "testuser",
			tags: [],
			version: "1.0.0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const content = "# User Rule Content";
		const pulledRule = fileManager.saveRule(rule, content);

		// Check pulled rule has full path name
		expect(pulledRule.name).toBe("@testuser/user-rule");

		// Check file path
		const rulePath = join(config.getRulesDir(), "@testuser", "user-rule.md");
		expect(existsSync(rulePath)).toBe(true);

		// Check symlink path
		const symlinkPath = join(config.getSymlinkDir(), "@testuser", "user-rule.md");
		expect(existsSync(symlinkPath)).toBe(true);
	});

	test("should read local rule", () => {
		// First save a rule
		const rule: Rule = {
			id: "read-test-id",
			name: "read-test",
			content: "# Read Test",
			visibility: "public",
			tags: [],
			version: "1.0.0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const content = "# Read Test Content\n\nThis should be readable.";
		fileManager.saveRule(rule, content);

		// Read the rule
		const readContent = fileManager.readLocalRule("read-test");
		expect(readContent).toBe(content);
	});

	test("should return null when reading non-existent rule", () => {
		const content = fileManager.readLocalRule("non-existent");
		expect(content).toBeNull();
	});

	test("should update local rule", () => {
		// First save a rule
		const rule: Rule = {
			id: "update-test-id",
			name: "update-test",
			content: "# Original",
			visibility: "public",
			tags: [],
			version: "1.0.0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		fileManager.saveRule(rule, "# Original Content");

		// Update the rule
		const pulledRule: PulledRule = {
			name: "update-test",
			version: "1.0.1",
			pulledAt: new Date().toISOString(),
		};

		const newContent = "# Updated Content";
		fileManager.updateLocalRule(pulledRule, newContent);

		// Verify update
		const readContent = fileManager.readLocalRule("update-test");
		expect(readContent).toBe(newContent);
	});

	test("should check if rule exists", () => {
		const rule: Rule = {
			id: "exists-test-id",
			name: "exists-test",
			content: "# Exists Test",
			visibility: "public",
			tags: [],
			version: "1.0.0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		fileManager.saveRule(rule, "# Content");

		const pulledRule: PulledRule = {
			name: "exists-test",
			version: "1.0.0",
			pulledAt: new Date().toISOString(),
		};

		expect(fileManager.ruleExists(pulledRule)).toBe(true);

		const nonExistentRule: PulledRule = {
			name: "non-existent",
			version: "1.0.0",
			pulledAt: new Date().toISOString(),
		};

		expect(fileManager.ruleExists(nonExistentRule)).toBe(false);
	});

	test("should remove symlink", () => {
		const rule: Rule = {
			id: "remove-test-id",
			name: "remove-test",
			content: "# Remove Test",
			visibility: "public",
			tags: [],
			version: "1.0.0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const pulledRule = fileManager.saveRule(rule, "# Content");
		const symlinkPath = join(config.getSymlinkDir(), "remove-test.md");

		// Verify symlink exists
		expect(existsSync(symlinkPath)).toBe(true);

		// Remove symlink
		fileManager.removeSymlink(pulledRule);

		// Verify symlink is removed
		expect(existsSync(symlinkPath)).toBe(false);

		// Verify actual file still exists
		const rulePath = join(config.getRulesDir(), "remove-test.md");
		expect(existsSync(rulePath)).toBe(true);
	});

	test("should recreate symlink if it already exists", () => {
		const rule: Rule = {
			id: "recreate-test-id",
			name: "recreate-test",
			content: "# Recreate Test",
			visibility: "public",
			tags: [],
			version: "1.0.0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		// Save rule twice
		fileManager.saveRule(rule, "# First Content");
		fileManager.saveRule(rule, "# Second Content");

		// Verify symlink still exists and points to correct file
		const symlinkPath = join(config.getSymlinkDir(), "recreate-test.md");
		expect(existsSync(symlinkPath)).toBe(true);

		// Read content through symlink
		const content = readFileSync(symlinkPath, "utf-8");
		expect(content).toBe("# Second Content");
	});

	test("should use user.username when available", () => {
		const rule: Rule = {
			id: "user-test-id",
			name: "test-rule",
			content: "# Test",
			visibility: "public",
			user: {
				id: "user-123",
				username: "myusername",
				email: "user@example.com",
			},
			tags: [],
			version: "1.0.0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const pulledRule = fileManager.saveRule(rule, "# Content");

		// Should use user.username instead of owner
		expect(pulledRule.name).toBe("@myusername/test-rule");

		// Check file is saved in correct location
		const rulePath = join(config.getRulesDir(), "@myusername", "test-rule.md");
		expect(existsSync(rulePath)).toBe(true);
	});

	test("should handle full path names in PulledRule", () => {
		// Test with organization rule
		const orgRule: PulledRule = {
			name: "@myorg/test-rule",
			version: "1.0.0",
			pulledAt: new Date().toISOString(),
		};

		// Create the file manually to test reading
		const orgRulePath = join(config.getRulesDir(), "@myorg", "test-rule.md");
		mkdirSync(join(config.getRulesDir(), "@myorg"), { recursive: true });
		writeFileSync(orgRulePath, "# Org Rule Content");

		expect(fileManager.ruleExists(orgRule)).toBe(true);

		// Test with user rule
		const userRule: PulledRule = {
			name: "@testuser/test-rule",
			version: "1.0.0",
			pulledAt: new Date().toISOString(),
		};

		// Create the file manually to test reading
		const userRulePath = join(config.getRulesDir(), "@testuser", "test-rule.md");
		mkdirSync(join(config.getRulesDir(), "@testuser"), { recursive: true });
		writeFileSync(userRulePath, "# User Rule Content");

		expect(fileManager.ruleExists(userRule)).toBe(true);

		// Test updating with full path names
		fileManager.updateLocalRule(orgRule, "# Updated Org Content");
		expect(readFileSync(orgRulePath, "utf-8")).toBe("# Updated Org Content");

		fileManager.updateLocalRule(userRule, "# Updated User Content");
		expect(readFileSync(userRulePath, "utf-8")).toBe("# Updated User Content");
	});
});
