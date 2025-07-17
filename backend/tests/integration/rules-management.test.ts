import { describe, expect, it, beforeEach } from "vitest";
import { SELF } from "cloudflare:test";
import { setupTestHooks, createTestUser } from "../helpers/setup";

describe("Rules Management endpoints", () => {
	setupTestHooks();

	let authToken: string;
	let authToken2: string;
	let testUserId: string;
	let testUserId2: string;
	let testRuleId: string;
	let testRuleName: string;

	beforeEach(async () => {
		// Create test users
		const user1 = await createTestUser({
			email: `rules1-${Date.now()}@example.com`,
			username: `rules1${Math.floor(Math.random() * 10000)}`,
			password: "password123",
		});
		authToken = user1.token;
		testUserId = user1.user.id;

		const user2 = await createTestUser({
			email: `rules2-${Date.now()}@example.com`,
			username: `rules2${Math.floor(Math.random() * 10000)}`,
			password: "password123",
		});
		authToken2 = user2.token;
		testUserId2 = user2.user.id;

		// Create a test rule for use in other tests
		const response = await SELF.fetch("http://localhost/rules", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${authToken}`,
			},
			body: JSON.stringify({
				name: `test-rule-${Date.now()}`,
				description: "A test rule for testing",
				tags: ["test", "example"],
				visibility: "public",
				content: JSON.stringify({
					rules: {
						"no-console": "error",
						"no-debugger": "error",
					},
				}),
			}),
		});

		if (response.status !== 201) {
			const error = await response.text();
			console.error("Failed to create test rule:", response.status, error);
		}
		expect(response.status).toBe(201);

		const data = await response.json();
		testRuleId = data.id;
		testRuleName = data.name;
	});

	describe("PUT /rules/:id", () => {
		it("should update rule successfully by owner", async () => {
			console.log("Test rule ID:", testRuleId);
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					description: "Updated description",
					tags: ["test", "updated"],
					content: JSON.stringify({
						rules: {
							"no-console": "warn",
							"no-debugger": "error",
							"no-alert": "error",
						},
					}),
					version: "1.0.1",
					changelog: "Added no-alert rule and changed no-console to warning",
				}),
			});

			if (response.status !== 200) {
				const error = await response.text();
				console.error("Failed to update rule:", response.status, error);
			}
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.description).toBe("Updated description");
			expect(data.tags).toEqual(["test", "updated"]);
			expect(data.version).toBe("1.0.1");
		});

		it("should fail to update rule by non-owner", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken2}`,
				},
				body: JSON.stringify({
					description: "Unauthorized update",
				}),
			});

			expect(response.status).toBe(401);

			const data = await response.json();
			expect(data.error).toBeDefined();
		});

		it("should fail to update non-existent rule", async () => {
			const response = await SELF.fetch("http://localhost/rules/non-existent-id", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					description: "Update non-existent",
				}),
			});

			expect(response.status).toBe(404);

			const data = await response.json();
			expect(data.error).toContain("not found");
		});
	});

	describe("DELETE /rules/:id", () => {
		it("should delete rule successfully by owner", async () => {
			// Create a rule to delete
			const createResponse = await SELF.fetch("http://localhost/rules", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					name: `delete-test-${Date.now()}`,
					description: "To be deleted",
					visibility: "public",
					content: JSON.stringify({ rules: {} }),
				}),
			});

			const createData = await createResponse.json();
			const ruleId = createData.id;

			// Delete the rule
			const response = await SELF.fetch(`http://localhost/rules/${ruleId}`, {
				method: "DELETE",
				headers: {
					"Authorization": `Bearer ${authToken}`,
				},
			});

			expect(response.status).toBe(204);

			// Verify rule is deleted
			const getResponse = await SELF.fetch(`http://localhost/rules/${createData.name}`, {
				method: "GET",
			});
			expect(getResponse.status).toBe(404);
		});

		it("should fail to delete rule by non-owner", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}`, {
				method: "DELETE",
				headers: {
					"Authorization": `Bearer ${authToken2}`,
				},
			});

			expect(response.status).toBe(401);

			const data = await response.json();
			expect(data.error).toBeDefined();
		});
	});

	describe("POST /rules/:id/star", () => {
		it("should star a rule successfully", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/star`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken2}`,
				},
				body: JSON.stringify({
					star: true,
				}),
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.starred).toBe(true);
			expect(data.stars).toBeGreaterThanOrEqual(1);
		});

		it("should unstar a rule successfully", async () => {
			// First star the rule
			await SELF.fetch(`http://localhost/rules/${testRuleId}/star`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken2}`,
				},
				body: JSON.stringify({
					star: true,
				}),
			});

			// Then unstar it
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/star`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken2}`,
				},
				body: JSON.stringify({
					star: false,
				}),
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.starred).toBe(false);
		});

		it("should fail without authentication", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/star`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					star: true,
				}),
			});

			expect(response.status).toBe(401);
		});
	});

	describe("POST /rules/:id/copy", () => {
		it("should copy a rule successfully", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/copy`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken2}`,
				},
				body: JSON.stringify({
					name: `copied-rule-${Date.now()}`,
					org: null,
					visibility: "private",
				}),
			});

			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.id).toBeDefined();
			expect(data.name).toContain("copied-rule");
			expect(data.visibility).toBe("private");
			expect(data.ownerId).toBe(testUserId2);
		});

		it("should fail to copy private rule by non-owner", async () => {
			// Create a private rule
			const createResponse = await SELF.fetch("http://localhost/rules", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					name: `private-rule-${Date.now()}`,
					description: "Private rule",
					visibility: "private",
					content: JSON.stringify({ rules: {} }),
				}),
			});

			const createData = await createResponse.json();

			// Try to copy it as another user
			const response = await SELF.fetch(`http://localhost/rules/${createData.id}/copy`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken2}`,
				},
				body: JSON.stringify({
					name: `copy-attempt-${Date.now()}`,
				}),
			});

			expect(response.status).toBe(403);
		});
	});

	describe("POST /rules/:id/publish", () => {
		it("should publish new version successfully", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/publish`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					version: "2.0.0",
					changelog: "Major update with breaking changes",
					content: JSON.stringify({
						rules: {
							"no-console": "off",
							"no-debugger": "error",
							"no-var": "error",
						},
					}),
				}),
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.version).toBe("2.0.0");
			expect(data.latest_version_id).toBeDefined();
		});

		it("should fail to publish by non-owner", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/publish`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken2}`,
				},
				body: JSON.stringify({
					version: "2.0.0",
					changelog: "Unauthorized publish",
					content: JSON.stringify({ rules: {} }),
				}),
			});

			expect(response.status).toBe(403);
		});
	});

	describe("PUT /rules/:id/visibility", () => {
		it("should change visibility to private", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/visibility`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					visibility: "private",
				}),
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.visibility).toBe("private");
		});

		it("should fail to change visibility by non-owner", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/visibility`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken2}`,
				},
				body: JSON.stringify({
					visibility: "private",
				}),
			});

			expect(response.status).toBe(403);
		});

		it("should fail with invalid visibility value", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/visibility`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					visibility: "invalid",
				}),
			});

			expect(response.status).toBe(400);
		});
	});

	describe("GET /rules/:id/download", () => {
		it("should download rule content in JSON format", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/download?format=json`, {
				method: "GET",
			});

			expect(response.status).toBe(200);
			expect(response.headers.get("Content-Type")).toContain("application/json");

			const data = await response.json();
			expect(data.content).toBeDefined();
			expect(data.id).toBeDefined();
			expect(data.name).toBeDefined();
			expect(data.version).toBeDefined();

			// Parse the content to check for rules
			const contentObj = JSON.parse(data.content);
			expect(contentObj.rules).toBeDefined();
		});

		it("should download rule content in markdown format", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/download?format=markdown`, {
				method: "GET",
			});

			expect(response.status).toBe(200);
			expect(response.headers.get("Content-Type")).toContain("text/markdown");

			const content = await response.text();
			// The content should be the raw stored content, which is JSON in this case
			expect(content).toBeDefined();
			expect(content.length).toBeGreaterThan(0);
		});

		it("should fail to download private rule without auth", async () => {
			// First make the rule private
			await SELF.fetch(`http://localhost/rules/${testRuleId}/visibility`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					visibility: "private",
				}),
			});

			// Try to download without auth
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/download`, {
				method: "GET",
			});

			expect(response.status).toBe(401);
		});
	});

	describe("Version management", () => {
		it("should get version history", async () => {
			// First publish a new version
			await SELF.fetch(`http://localhost/rules/${testRuleId}/publish`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					version: "1.1.0",
					changelog: "Minor update",
					content: JSON.stringify({ rules: { "no-console": "warn" } }),
				}),
			});

			// Get version history
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/versions`, {
				method: "GET",
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.versions).toBeDefined();
			expect(Array.isArray(data.versions)).toBe(true);
			expect(data.versions.length).toBeGreaterThanOrEqual(2); // Initial + published
		});

		it("should get specific version", async () => {
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/versions/1.0.0`, {
				method: "GET",
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.version_number).toBe("1.0.0");
			expect(data.content).toBeDefined();
		});

		it("should get diff between versions", async () => {
			// First publish a new version
			await SELF.fetch(`http://localhost/rules/${testRuleId}/publish`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					version: "1.2.0",
					changelog: "Another update",
					content: JSON.stringify({
						rules: {
							"no-console": "error",
							"no-debugger": "warn",
							"no-alert": "error",
						}
					}),
				}),
			});

			// Get diff
			const response = await SELF.fetch(`http://localhost/rules/${testRuleId}/diff?from=1.0.0&to=1.2.0`, {
				method: "GET",
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.from).toBe("1.0.0");
			expect(data.to).toBe("1.2.0");
			expect(data.diff).toBeDefined();
		});
	});

	describe("Organization rules", () => {
		it.skip("should get rule by organization and name", async () => {
			// Create a rule with organization
			const createResponse = await SELF.fetch("http://localhost/rules", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					name: `org-rule-${Date.now()}`,
					org: "test-org",
					description: "Organization rule",
					visibility: "public",
					content: JSON.stringify({ rules: {} }),
				}),
			});

			if (createResponse.status !== 201) {
				const error = await createResponse.text();
				console.error("Failed to create org rule:", createResponse.status, error);
			}
			expect(createResponse.status).toBe(201);

			const createData = await createResponse.json();
			console.log("Created org rule:", createData);

			// Access organization rule using @org/rulename pattern
			const response = await SELF.fetch(`http://localhost/rules/@test-org/${createData.name}`, {
				method: "GET",
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.name).toBe(createData.name);
			expect(data.organization).toBe("test-org");
		});
	});
});
