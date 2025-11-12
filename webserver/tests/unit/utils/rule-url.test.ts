import { describe, expect, it } from "vitest";

// Mock rule data types for testing
interface MockRule {
	id: string;
	name: string;
	author: {
		username: string;
	};
	organization?: {
		name: string;
	} | null;
}

// Rule URL generation function (extracted from component logic)
const getRuleUrl = (rule: MockRule): string => {
	if (rule.organization) {
		return `/rules/@${rule.organization.name}/${rule.name}`;
	}
	return `/rules/@${rule.author.username}/${rule.name}`;
};

describe("Rule URL Generation Utility", () => {
	describe("User-owned rules", () => {
		it("should generate correct URL for user-owned rule", () => {
			const rule: MockRule = {
				id: "rule_1",
				name: "my-awesome-rule",
				author: {
					username: "johndoe",
				},
				organization: null,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@johndoe/my-awesome-rule");
		});

		it("should handle usernames with special characters", () => {
			const rule: MockRule = {
				id: "rule_2",
				name: "test-rule",
				author: {
					username: "user-with-dashes_and_underscores",
				},
				organization: null,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@user-with-dashes_and_underscores/test-rule");
		});

		it("should handle rule names with special characters", () => {
			const rule: MockRule = {
				id: "rule_3",
				name: "rule-with_special-chars123",
				author: {
					username: "normaluser",
				},
				organization: null,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@normaluser/rule-with_special-chars123");
		});

		it("should handle undefined organization", () => {
			const rule: MockRule = {
				id: "rule_4",
				name: "undefined-org-rule",
				author: {
					username: "testuser",
				},
				organization: undefined,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@testuser/undefined-org-rule");
		});
	});

	describe("Organization-owned rules", () => {
		it("should generate correct URL for organization-owned rule", () => {
			const rule: MockRule = {
				id: "rule_5",
				name: "company-rule",
				author: {
					username: "employee",
				},
				organization: {
					name: "mycompany",
				},
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@mycompany/company-rule");
		});

		it("should prioritize organization over author for URL generation", () => {
			const rule: MockRule = {
				id: "rule_6",
				name: "shared-rule",
				author: {
					username: "creator",
				},
				organization: {
					name: "sharedorg",
				},
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@sharedorg/shared-rule");
			expect(url).not.toContain("creator");
		});

		it("should handle organization names with special characters", () => {
			const rule: MockRule = {
				id: "rule_7",
				name: "special-rule",
				author: {
					username: "user",
				},
				organization: {
					name: "org-with-dashes_and_numbers123",
				},
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@org-with-dashes_and_numbers123/special-rule");
		});
	});

	describe("Edge cases", () => {
		it("should handle empty rule name", () => {
			const rule: MockRule = {
				id: "rule_8",
				name: "",
				author: {
					username: "testuser",
				},
				organization: null,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@testuser/");
		});

		it("should handle very long rule names", () => {
			const longRuleName = `very-long-rule-name-that-might-cause-issues-${"a".repeat(100)}`;
			const rule: MockRule = {
				id: "rule_9",
				name: longRuleName,
				author: {
					username: "testuser",
				},
				organization: null,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe(`/rules/@testuser/${longRuleName}`);
		});

		it("should handle very long usernames", () => {
			const longUsername = `very-long-username-${"b".repeat(50)}`;
			const rule: MockRule = {
				id: "rule_10",
				name: "normal-rule",
				author: {
					username: longUsername,
				},
				organization: null,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe(`/rules/@${longUsername}/normal-rule`);
		});

		it("should handle very long organization names", () => {
			const longOrgName = `very-long-organization-name-${"c".repeat(50)}`;
			const rule: MockRule = {
				id: "rule_11",
				name: "org-rule",
				author: {
					username: "user",
				},
				organization: {
					name: longOrgName,
				},
			};

			const url = getRuleUrl(rule);
			expect(url).toBe(`/rules/@${longOrgName}/org-rule`);
		});
	});

	describe("Real-world scenarios", () => {
		it("should handle typical personal coding rule", () => {
			const rule: MockRule = {
				id: "rule_12",
				name: "typescript-coding-standards",
				author: {
					username: "senior-dev",
				},
				organization: null,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@senior-dev/typescript-coding-standards");
		});

		it("should handle corporate team rule", () => {
			const rule: MockRule = {
				id: "rule_13",
				name: "api-design-guidelines",
				author: {
					username: "tech-lead",
				},
				organization: {
					name: "engineering-team",
				},
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@engineering-team/api-design-guidelines");
		});

		it("should handle open source project rule", () => {
			const rule: MockRule = {
				id: "rule_14",
				name: "contribution-guidelines",
				author: {
					username: "maintainer",
				},
				organization: {
					name: "open-source-project",
				},
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@open-source-project/contribution-guidelines");
		});
	});

	describe("URL format consistency", () => {
		it("should always start with /rules/", () => {
			const testCases: MockRule[] = [
				{
					id: "rule_1",
					name: "test",
					author: { username: "user" },
					organization: null,
				},
				{
					id: "rule_2",
					name: "test",
					author: { username: "user" },
					organization: { name: "org" },
				},
			];

			testCases.forEach((rule) => {
				const url = getRuleUrl(rule);
				expect(url).toMatch(/^\/rules\//);
			});
		});

		it("should always include @ prefix for owner", () => {
			const testCases: MockRule[] = [
				{
					id: "rule_1",
					name: "test",
					author: { username: "user" },
					organization: null,
				},
				{
					id: "rule_2",
					name: "test",
					author: { username: "user" },
					organization: { name: "org" },
				},
			];

			testCases.forEach((rule) => {
				const url = getRuleUrl(rule);
				expect(url).toMatch(/\/rules\/@\w+\//);
			});
		});

		it("should follow pattern /rules/@owner/rulename", () => {
			const testCases: MockRule[] = [
				{
					id: "rule_1",
					name: "my-rule",
					author: { username: "myuser" },
					organization: null,
				},
				{
					id: "rule_2",
					name: "org-rule",
					author: { username: "user" },
					organization: { name: "myorg" },
				},
			];

			testCases.forEach((rule) => {
				const url = getRuleUrl(rule);
				expect(url).toMatch(/^\/rules\/@[\w-]+\/[\w-]+$/);
			});
		});
	});
});
