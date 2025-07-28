import { describe, expect, test } from "bun:test";
import type { PulledRule, Rule, ZxcvMetadata } from "../../src/types";

describe("Type validation", () => {
	test("should validate Rule type", () => {
		const rule: Rule = {
			id: "test-id",
			name: "test-rule",
			content: "# Test",
			visibility: "public",
			tags: ["test"],
			version: "1.0.0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		expect(rule.id).toBe("test-id");
		expect(rule.visibility).toMatch(/^(public|private)$/);
		expect(Array.isArray(rule.tags)).toBe(true);
	});

	test("should validate PulledRule type", () => {
		const pulledRule: PulledRule = {
			name: "test-rule",
			path: "test-path",
			version: "1.0.0",
			pulledAt: new Date().toISOString(),
		};

		expect(pulledRule.name).toBe("test-rule");
		expect(pulledRule.owner).toBeUndefined();
		expect(pulledRule.organization).toBeUndefined();
	});

	test("should validate ZxcvMetadata type", () => {
		const metadata: ZxcvMetadata = {
			version: "1.0.0",
			lastSync: new Date().toISOString(),
			rules: [],
		};

		expect(metadata.version).toBe("1.0.0");
		expect(Array.isArray(metadata.rules)).toBe(true);
		expect(metadata.rules.length).toBe(0);
	});

	test("should handle optional fields in Rule", () => {
		const rule: Rule = {
			id: "test-id",
			name: "test-rule",
			content: "# Test",
			visibility: "private",
			owner: "testuser",
			organization: "testorg",
			tags: [],
			version: "1.0.0",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		expect(rule.owner).toBe("testuser");
		expect(rule.organization).toBe("testorg");
	});
});
