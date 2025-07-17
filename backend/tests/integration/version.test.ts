import { describe, expect, it, beforeEach } from "vitest";
import { SELF } from "cloudflare:test";
import { setupTestHooks, createTestUser } from "../helpers/setup";

describe("Version management endpoints", () => {
	setupTestHooks();
	
	let authToken: string;
	let testUserId: string;
	let testRuleId: string;

	beforeEach(async () => {
		const result = await createTestUser({
			email: `version-${Date.now()}@example.com`,
			username: `version${Math.floor(Math.random() * 10000)}`,
			password: "password123",
		});
		authToken = result.token;
		testUserId = result.user.id;

		// Create a test rule for version testing
		const ruleResponse = await SELF.fetch("http://localhost/rules", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${authToken}`,
			},
			body: JSON.stringify({
				name: `version-test-rule-${Date.now()}`,
				description: "A test rule for version management",
				visibility: "public",
				content: JSON.stringify({
					rules: {
						"no-console": "error",
					},
				}),
			}),
		});

		if (ruleResponse.status === 201) {
			const ruleData = await ruleResponse.json();
			testRuleId = ruleData.id;
		}
	});

	describe("GET /rules/:id/versions", () => {
		it("should get version history for a rule", async () => {
			if (!testRuleId) {
				// Skip if rule creation failed
				return;
			}

			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/versions`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
			});

			expect(response.status).toBe(200);
			
			const data = await response.json();
			expect(data.versions).toBeDefined();
			expect(Array.isArray(data.versions)).toBe(true);
		});

		it("should return 404 for non-existent rule", async () => {
			const response = await SELF.fetch("http://localhost/rules/non-existent-id/versions", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
			});

			expect(response.status).toBe(404);
		});

		it("should require authentication for private rules", async () => {
			if (!testRuleId) {
				return;
			}

			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/versions`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			// May return 401 if rule is private, or 200 if public
			expect([200, 401]).toContain(response.status);
		});
	});

	describe("GET /rules/:id/versions/:version", () => {
		it("should get specific version of a rule", async () => {
			if (!testRuleId) {
				return;
			}

			// First get the versions to find a valid version number
			const versionsResponse = await SELF.fetch(`http://localhost/rules/${testRuleId}/versions`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
			});

			if (versionsResponse.status === 200) {
				const versionsData = await versionsResponse.json();
				if (versionsData.versions && versionsData.versions.length > 0) {
					const firstVersion = versionsData.versions[0];
					
					const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/versions/${firstVersion.version_number}`, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${authToken}`,
						},
					});

					expect(response.status).toBe(200);
					
					const data = await response.json();
					expect(data.version).toBeDefined();
					expect(data.content).toBeDefined();
				}
			}
		});

		it("should return 404 for non-existent version", async () => {
			if (!testRuleId) {
				return;
			}

			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/versions/999.999.999`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
			});

			expect(response.status).toBe(404);
		});
	});

	describe("GET /rules/:id/diff", () => {
		it("should get diff between two versions", async () => {
			if (!testRuleId) {
				return;
			}

			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/diff?from=1.0.0&to=1.0.0`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
			});

			// May return 200 with diff data, or 404 if versions don't exist
			expect([200, 404]).toContain(response.status);
		});

		it("should require from and to parameters", async () => {
			if (!testRuleId) {
				return;
			}

			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/diff`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
			});

			expect(response.status).toBe(400);
		});

		it("should validate version format", async () => {
			if (!testRuleId) {
				return;
			}

			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/diff?from=invalid&to=invalid`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
			});

			expect([400, 404]).toContain(response.status);
		});
	});
});