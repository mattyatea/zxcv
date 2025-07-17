import { describe, expect, it, beforeEach } from "vitest";
import { SELF } from "cloudflare:test";
import { setupTestHooks, createTestUser, createTestRule, createTestTeam } from "../helpers/setup";

describe("Rules Extended endpoints", () => {
  setupTestHooks();
  
  let authToken: string;
  let userId: string;
  let secondUserToken: string;
  let secondUserId: string;

  beforeEach(async () => {
    // Create primary test user
    const result = await createTestUser({
      email: `rules-ext-${Date.now()}@example.com`,
      username: `rulesext${Math.floor(Math.random() * 10000)}`,
      password: "password123",
    });
    authToken = result.token;
    userId = result.user.id;

    // Create second test user
    const secondResult = await createTestUser({
      email: `rules-ext2-${Date.now()}@example.com`,
      username: `rulesext2${Math.floor(Math.random() * 10000)}`,
      password: "password123",
    });
    secondUserToken = secondResult.token;
    secondUserId = secondResult.user.id;
  });

  describe("PUT /rules/:id/visibility", () => {
    it("should change visibility from private to public", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "private",
      });

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          visibility: "public",
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.visibility).toBe("public");
    });

    it("should change visibility to team", async () => {
      const team = await createTestTeam(authToken);
      const rule = await createTestRule(authToken, {
        visibility: "private",
      });

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          visibility: "team",
          teamId: team.id,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.visibility).toBe("team");
      expect(data.teamId).toBe(team.id);
    });

    it("should fail to change visibility without ownership", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "public",
      });

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          visibility: "private",
        }),
      });

      expect(response.status).toBe(403);
    });

    it("should fail with team visibility without teamId", async () => {
      const rule = await createTestRule(authToken);

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          visibility: "team",
        }),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain("Team ID is required");
    });

    it("should fail with team visibility if not team member", async () => {
      const team = await createTestTeam(secondUserToken); // Team owned by second user
      const rule = await createTestRule(authToken);

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          visibility: "team",
          teamId: team.id,
        }),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain("must be a member of the team");
    });
  });

  describe("POST /rules/:id/copy", () => {
    it("should copy a public rule", async () => {
      const originalRule = await createTestRule(authToken, {
        name: "original-rule",
        visibility: "public",
        content: '{"rules": {"no-console": "error"}}',
      });

      const response = await SELF.fetch(`http://localhost/rules/${originalRule.id}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          name: "copied-rule",
          visibility: "private",
        }),
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.name).toBe("copied-rule");
      expect(data.visibility).toBe("private");
      // Copied rule should have the same content
      expect(data.id).not.toBe(originalRule.id);
    });

    it("should copy own private rule", async () => {
      const originalRule = await createTestRule(authToken, {
        name: "private-rule",
        visibility: "private",
      });

      const response = await SELF.fetch(`http://localhost/rules/${originalRule.id}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "copied-private-rule",
        }),
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.name).toBe("copied-private-rule");
    });

    it("should fail to copy another user's private rule", async () => {
      const originalRule = await createTestRule(authToken, {
        visibility: "private",
      });

      const response = await SELF.fetch(`http://localhost/rules/${originalRule.id}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          name: "unauthorized-copy",
        }),
      });

      expect(response.status).toBe(403);
    });

    it("should copy team rule if member", async () => {
      const team = await createTestTeam(authToken);
      
      // Add second user to team
      const addMemberResponse = await SELF.fetch(`http://localhost/teams/${team.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId: secondUserId,
          role: "member",
        }),
      });
      
      if (!addMemberResponse.ok) {
        const error = await addMemberResponse.text();
        throw new Error(`Failed to add member: ${error}`);
      }

      // Create team rule
      const originalRule = await createTestRule(authToken, {
        visibility: "team",
        teamId: team.id,
      });

      // Copy with second user
      const response = await SELF.fetch(`http://localhost/rules/${originalRule.id}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          name: "copied-team-rule",
        }),
      });

      expect(response.status).toBe(201);
    });

    it("should fail with duplicate name", async () => {
      const existingRule = await createTestRule(authToken, {
        name: "existing-rule",
      });

      const response = await SELF.fetch(`http://localhost/rules/${existingRule.id}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "existing-rule", // Same name
        }),
      });

      expect(response.status).toBe(409);
    });
  });

  describe("POST /rules/:id/star", () => {
    it("should star a public rule", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "public",
      });

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/star`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          star: true,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.stars).toBe(1);
      expect(data.starred).toBe(true);
    });

    it("should unstar a rule", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "public",
      });

      // First star it
      await SELF.fetch(`http://localhost/rules/${rule.id}/star`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          star: true,
        }),
      });

      // Then unstar it
      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/star`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          star: false,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.stars).toBe(0);
      expect(data.starred).toBe(false);
    });

    it("should handle multiple stars", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "public",
      });

      // Star with first user
      await SELF.fetch(`http://localhost/rules/${rule.id}/star`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          star: true,
        }),
      });

      // Star with second user
      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/star`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          star: true,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.stars).toBe(2);
      expect(data.starred).toBe(true);
    });

    it("should fail to star private rule of another user", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "private",
      });

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/star`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          star: true,
        }),
      });

      expect(response.status).toBe(403);
    });

    it("should handle idempotent star operations", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "public",
      });

      // Star twice
      await SELF.fetch(`http://localhost/rules/${rule.id}/star`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          star: true,
        }),
      });

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/star`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          star: true,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.stars).toBe(1); // Should still be 1
      expect(data.message).toContain("already starred");
    });
  });

  describe("GET /rules/:id/download", () => {
    it("should download public rule", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "public",
        content: '{"rules": {"no-console": "error"}}',
      });

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/download`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
      expect(response.headers.get("Content-Disposition")).toContain("attachment");
      
      const content = await response.text();
      expect(content).toBe('{"rules": {"no-console": "error"}}');
    });

    it("should download specific version", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "public",
        content: '{"version": "1.0.0"}',
      });

      // Update rule to create new version
      await SELF.fetch(`http://localhost/rules/${rule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: '{"version": "2.0.0"}',
        }),
      });

      // Download specific version
      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/download?version=1.0.0`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
      
      const content = await response.text();
      expect(content).toBe('{"version": "1.0.0"}');
    });

    it("should download own private rule", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "private",
        content: '{"private": true}',
      });

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/download`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const content = await response.text();
      expect(content).toBe('{"private": true}');
    });

    it("should fail to download another user's private rule", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "private",
      });

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/download`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${secondUserToken}`,
        },
      });

      expect(response.status).toBe(401);
    });

    it("should return 404 for non-existent rule", async () => {
      const response = await SELF.fetch("http://localhost/rules/non-existent-id/download", {
        method: "GET",
      });

      expect(response.status).toBe(404);
    });

    it("should return 404 for non-existent version", async () => {
      const rule = await createTestRule(authToken, {
        visibility: "public",
      });

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/download?version=99.0.0`, {
        method: "GET",
      });

      expect(response.status).toBe(404);
    });
  });

  describe("POST /rules/:id/publish", () => {
    it("should publish new version", async () => {
      const rule = await createTestRule(authToken);

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          version: "2.0.0",
          content: '{"version": "2.0.0", "rules": {}}',
          changelog: "Major update",
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.version).toBe("2.0.0");
      expect(data.latest_version_id).toBeDefined();
    });

    it("should fail to publish without ownership", async () => {
      const rule = await createTestRule(authToken);

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          version: "2.0.0",
          content: '{"version": "2.0.0"}',
        }),
      });

      expect(response.status).toBe(403);
    });

    it("should validate version format", async () => {
      const rule = await createTestRule(authToken);

      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          version: "invalid-version",
          content: '{}',
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should prevent duplicate version", async () => {
      const rule = await createTestRule(authToken);

      // Publish version 2.0.0
      await SELF.fetch(`http://localhost/rules/${rule.id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          version: "2.0.0",
          content: '{"version": "2.0.0"}',
        }),
      });

      // Try to publish same version again
      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          version: "2.0.0",
          content: '{"version": "2.0.0", "updated": true}',
        }),
      });

      expect(response.status).toBe(409);
      
      const data = await response.json();
      expect(data.error).toContain("already exists");
    });

    it("should allow team members with edit permission to publish", async () => {
      const team = await createTestTeam(authToken);
      
      // Add second user as admin
      const addMemberResponse = await SELF.fetch(`http://localhost/teams/${team.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId: secondUserId,
          role: "admin",
        }),
      });
      
      if (!addMemberResponse.ok) {
        const error = await addMemberResponse.text();
        throw new Error(`Failed to add member: ${error}`);
      }

      // Create team rule
      const rule = await createTestRule(authToken, {
        visibility: "team",
        teamId: team.id,
      });

      // Publish with second user (team admin)
      const response = await SELF.fetch(`http://localhost/rules/${rule.id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          version: "2.0.0",
          content: '{"version": "2.0.0"}',
          changelog: "Team member update",
        }),
      });

      expect(response.status).toBe(200);
    });
  });
});