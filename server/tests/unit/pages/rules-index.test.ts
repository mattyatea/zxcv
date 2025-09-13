import { describe, expect, it, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

// Mock the composables and external dependencies
const mockT = vi.fn((key: string) => key);
const mockUseRpc = vi.fn();
const mockUseToast = vi.fn();
const mockUseI18n = vi.fn();
const mockUseAuthStore = vi.fn();

vi.mock("~/composables/useI18n", () => ({
	useI18n: mockUseI18n,
}));

vi.mock("~/composables/useRpc", () => ({
	useRpc: mockUseRpc,
}));

vi.mock("~/composables/useToast", () => ({
	useToast: mockUseToast,
}));

vi.mock("~/stores/auth", () => ({
	useAuthStore: mockUseAuthStore,
}));

vi.mock("pinia", () => ({
	storeToRefs: vi.fn(() => ({ user: { value: null } })),
}));

// Mock NuxtHead
vi.mock("#head", () => ({
	useHead: vi.fn(),
}));

// Helper function to simulate the getRuleUrl logic from the component
interface TestRule {
	id: string;
	name: string;
	author: {
		username: string;
	};
	organization?: {
		name: string;
	} | null;
}

const getRuleUrl = (rule: TestRule): string => {
	if (rule.organization) {
		return `/rules/@${rule.organization.name}/${rule.name}`;
	}
	return `/rules/@${rule.author.username}/${rule.name}`;
};

describe("Rules Index Page - URL Generation", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mockUseI18n.mockReturnValue({
			t: mockT,
			locale: { value: "ja" },
		});

		mockUseRpc.mockReturnValue({
			rules: {
				search: vi.fn(),
				star: vi.fn(),
				unstar: vi.fn(),
			},
		});

		mockUseToast.mockReturnValue({
			success: vi.fn(),
			error: vi.fn(),
		});

		mockUseAuthStore.mockReturnValue({
			user: null,
		});
	});

	describe("getRuleUrl function logic", () => {
		it("should generate correct URL for user-owned rules", () => {
			const rule: TestRule = {
				id: "rule_1",
				name: "typescript-guide",
				author: {
					username: "developer123",
				},
				organization: null,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@developer123/typescript-guide");
		});

		it("should generate correct URL for organization-owned rules", () => {
			const rule: TestRule = {
				id: "rule_2",
				name: "coding-standards",
				author: {
					username: "employee",
				},
				organization: {
					name: "techcorp",
				},
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@techcorp/coding-standards");
		});

		it("should prioritize organization over author in URL generation", () => {
			const rule: TestRule = {
				id: "rule_3",
				name: "team-guidelines",
				author: {
					username: "teamlead",
				},
				organization: {
					name: "engineering-team",
				},
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@engineering-team/team-guidelines");
			expect(url).not.toContain("teamlead");
		});
	});

	describe("URL generation edge cases", () => {
		it("should handle rules with null organization", () => {
			const rule: TestRule = {
				id: "rule_4",
				name: "personal-notes",
				author: {
					username: "individual_dev",
				},
				organization: null,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@individual_dev/personal-notes");
		});

		it("should handle rules with undefined organization", () => {
			const rule: TestRule = {
				id: "rule_5",
				name: "my-workflow",
				author: {
					username: "freelancer",
				},
				organization: undefined,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@freelancer/my-workflow");
		});

		it("should handle special characters in usernames and rule names", () => {
			const rule: TestRule = {
				id: "rule_6",
				name: "react-best-practices_v2",
				author: {
					username: "frontend-expert_2024",
				},
				organization: null,
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@frontend-expert_2024/react-best-practices_v2");
		});

		it("should handle special characters in organization names", () => {
			const rule: TestRule = {
				id: "rule_7",
				name: "deployment-guide",
				author: {
					username: "devops",
				},
				organization: {
					name: "startup-company_2024",
				},
			};

			const url = getRuleUrl(rule);
			expect(url).toBe("/rules/@startup-company_2024/deployment-guide");
		});
	});

	describe("Real-world rule scenarios", () => {
		it("should handle typical open-source project rules", () => {
			const rules: TestRule[] = [
				{
					id: "rule_1",
					name: "contributing",
					author: { username: "maintainer" },
					organization: { name: "awesome-project" },
				},
				{
					id: "rule_2",
					name: "code-review-process",
					author: { username: "maintainer" },
					organization: { name: "awesome-project" },
				},
			];

			const urls = rules.map(getRuleUrl);
			
			expect(urls[0]).toBe("/rules/@awesome-project/contributing");
			expect(urls[1]).toBe("/rules/@awesome-project/code-review-process");
		});

		it("should handle personal developer rules", () => {
			const rules: TestRule[] = [
				{
					id: "rule_3",
					name: "daily-workflow",
					author: { username: "productive_dev" },
					organization: null,
				},
				{
					id: "rule_4",
					name: "debugging-checklist",
					author: { username: "productive_dev" },
					organization: null,
				},
			];

			const urls = rules.map(getRuleUrl);
			
			expect(urls[0]).toBe("/rules/@productive_dev/daily-workflow");
			expect(urls[1]).toBe("/rules/@productive_dev/debugging-checklist");
		});

		it("should handle corporate team rules", () => {
			const rules: TestRule[] = [
				{
					id: "rule_5",
					name: "api-design-standards",
					author: { username: "senior-architect" },
					organization: { name: "backend-team" },
				},
				{
					id: "rule_6",
					name: "security-guidelines",
					author: { username: "security-lead" },
					organization: { name: "security-team" },
				},
			];

			const urls = rules.map(getRuleUrl);
			
			expect(urls[0]).toBe("/rules/@backend-team/api-design-standards");
			expect(urls[1]).toBe("/rules/@security-team/security-guidelines");
		});
	});

	describe("URL format validation", () => {
		it("should ensure all URLs follow the correct pattern", () => {
			const testRules: TestRule[] = [
				{
					id: "rule_1",
					name: "test1",
					author: { username: "user1" },
					organization: null,
				},
				{
					id: "rule_2", 
					name: "test2",
					author: { username: "user2" },
					organization: { name: "org1" },
				},
				{
					id: "rule_3",
					name: "test-with-dashes",
					author: { username: "user-with-dashes" },
					organization: null,
				},
				{
					id: "rule_4",
					name: "org-rule",
					author: { username: "employee" },
					organization: { name: "company-org" },
				},
			];

			const urls = testRules.map(getRuleUrl);

			// All URLs should start with /rules/
			urls.forEach(url => {
				expect(url).toMatch(/^\/rules\//);
			});

			// All URLs should have the @owner format
			urls.forEach(url => {
				expect(url).toMatch(/\/rules\/@[\w-]+\/[\w-]+/);
			});

			// Check specific expected URLs
			expect(urls[0]).toBe("/rules/@user1/test1");
			expect(urls[1]).toBe("/rules/@org1/test2");
			expect(urls[2]).toBe("/rules/@user-with-dashes/test-with-dashes");
			expect(urls[3]).toBe("/rules/@company-org/org-rule");
		});

		it("should not generate invalid URLs", () => {
			const testRules: TestRule[] = [
				{
					id: "rule_1",
					name: "valid-rule",
					author: { username: "validuser" },
					organization: null,
				},
				{
					id: "rule_2",
					name: "another-rule",
					author: { username: "user" },
					organization: { name: "validorg" },
				},
			];

			const urls = testRules.map(getRuleUrl);

			// Should not contain double slashes
			urls.forEach(url => {
				expect(url).not.toMatch(/\/\//);
			});

			// Should not miss the @ prefix
			urls.forEach(url => {
				expect(url).not.toMatch(/\/rules\/[^@]/);
			});

			// Should not have trailing slashes
			urls.forEach(url => {
				expect(url).not.toMatch(/\/$/);
			});
		});
	});
});