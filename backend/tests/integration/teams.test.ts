import { describe, expect, it, beforeEach } from "vitest";
import { SELF } from "cloudflare:test";
import { setupTestHooks, createTestUser, createTestTeam } from "../helpers/setup";

describe("Teams endpoints", () => {
  setupTestHooks();
  
  let authToken: string;
  let userId: string;
  let secondUserToken: string;
  let secondUserId: string;

  beforeEach(async () => {
    // Create primary test user
    const result = await createTestUser({
      email: `team-owner-${Date.now()}@example.com`,
      username: `teamowner${Math.floor(Math.random() * 10000)}`,
      password: "password123",
    });
    authToken = result.token;
    userId = result.user.id;

    // Create second test user
    const secondResult = await createTestUser({
      email: `team-member-${Date.now()}@example.com`,
      username: `teammember${Math.floor(Math.random() * 10000)}`,
      password: "password123",
    });
    secondUserToken = secondResult.token;
    secondUserId = secondResult.user.id;
  });

  describe("POST /teams", () => {
    it("should create a new team successfully", async () => {
      const response = await SELF.fetch("http://localhost/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: `test-team-${Date.now()}`,
          displayName: "Test Team",
          description: "A test team for unit testing",
        }),
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.name).toBeDefined();
      expect(data.displayName).toBe("Test Team");
      expect(data.description).toBe("A test team for unit testing");
      expect(data.ownerId).toBe(userId);
    });

    it("should fail without authentication", async () => {
      const response = await SELF.fetch("http://localhost/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "test-team",
          displayName: "Test Team",
        }),
      });

      expect(response.status).toBe(401);
    });

    it("should fail with duplicate team name", async () => {
      const teamName = `duplicate-team-${Date.now()}`;
      
      // Create first team
      await createTestTeam(authToken, { name: teamName });

      // Try to create duplicate
      const response = await SELF.fetch("http://localhost/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: teamName,
          displayName: "Duplicate Team",
        }),
      });

      expect(response.status).toBe(409);
      
      const data = await response.json();
      expect(data.error).toContain("already exists");
    });

    it("should fail with invalid team name format", async () => {
      const response = await SELF.fetch("http://localhost/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "invalid name with spaces",
          displayName: "Invalid Team",
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /teams", () => {
    it("should get user's teams", async () => {
      // Create a team first
      await createTestTeam(authToken);

      const response = await SELF.fetch("http://localhost/teams", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.results).toBeDefined();
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results.length).toBeGreaterThan(0);
      expect(data.total).toBeGreaterThan(0);
    });

    it("should fail without authentication", async () => {
      const response = await SELF.fetch("http://localhost/teams", {
        method: "GET",
      });

      expect(response.status).toBe(401);
    });

    it("should support pagination", async () => {
      // Create multiple teams
      for (let i = 0; i < 3; i++) {
        await createTestTeam(authToken, {
          name: `paginated-team-${Date.now()}-${i}`,
        });
      }

      const response = await SELF.fetch("http://localhost/teams?limit=2&offset=0", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.results.length).toBeLessThanOrEqual(2);
      expect(data.limit).toBe(2);
      expect(data.offset).toBe(0);
    });
  });

  describe("GET /teams/:id", () => {
    it("should get team details", async () => {
      const team = await createTestTeam(authToken);

      const response = await SELF.fetch(`http://localhost/teams/${team.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.id).toBe(team.id);
      expect(data.name).toBe(team.name);
      expect(data.members).toBeDefined();
      expect(data.ruleCount).toBeDefined();
    });

    it("should fail for non-member", async () => {
      const team = await createTestTeam(authToken);

      const response = await SELF.fetch(`http://localhost/teams/${team.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${secondUserToken}`,
        },
      });

      expect(response.status).toBe(403);
    });

    it("should return 404 for non-existent team", async () => {
      const response = await SELF.fetch("http://localhost/teams/non-existent-id", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /teams/:id", () => {
    it("should update team by owner", async () => {
      const team = await createTestTeam(authToken);

      const response = await SELF.fetch(`http://localhost/teams/${team.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          displayName: "Updated Team Name",
          description: "Updated description",
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.displayName).toBe("Updated Team Name");
      expect(data.description).toBe("Updated description");
    });

    it("should fail for non-admin member", async () => {
      const team = await createTestTeam(authToken);
      
      // Add second user as member
      await SELF.fetch(`http://localhost/teams/${team.id}/members`, {
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

      // Try to update with non-admin user
      const response = await SELF.fetch(`http://localhost/teams/${team.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          displayName: "Unauthorized Update",
        }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /teams/:id", () => {
    it("should delete team by owner", async () => {
      const team = await createTestTeam(authToken);

      const response = await SELF.fetch(`http://localhost/teams/${team.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(204);

      // Verify team is deleted
      const getResponse = await SELF.fetch(`http://localhost/teams/${team.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });
      expect(getResponse.status).toBe(404);
    });

    it("should fail for non-owner", async () => {
      const team = await createTestTeam(authToken);

      const response = await SELF.fetch(`http://localhost/teams/${team.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${secondUserToken}`,
        },
      });

      expect(response.status).toBe(403);
    });
  });

  describe("POST /teams/:id/members", () => {
    it("should add member to team", async () => {
      const team = await createTestTeam(authToken);

      const response = await SELF.fetch(`http://localhost/teams/${team.id}/members`, {
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

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.userId).toBe(secondUserId);
      expect(data.role).toBe("member");
    });

    it("should fail adding duplicate member", async () => {
      const team = await createTestTeam(authToken);

      // Add member first time
      await SELF.fetch(`http://localhost/teams/${team.id}/members`, {
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

      // Try to add again
      const response = await SELF.fetch(`http://localhost/teams/${team.id}/members`, {
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

      expect(response.status).toBe(409);
    });

    it("should fail for non-admin", async () => {
      const team = await createTestTeam(authToken);
      
      const response = await SELF.fetch(`http://localhost/teams/${team.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          userId: "some-user-id",
          role: "member",
        }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe("PUT /teams/:id/members/:userId", () => {
    it("should update member role", async () => {
      const team = await createTestTeam(authToken);
      
      // Add member first
      await SELF.fetch(`http://localhost/teams/${team.id}/members`, {
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

      // Update role
      const response = await SELF.fetch(`http://localhost/teams/${team.id}/members/${secondUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          role: "admin",
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.role).toBe("admin");
    });

    it("should fail for non-admin", async () => {
      const team = await createTestTeam(authToken);
      
      const response = await SELF.fetch(`http://localhost/teams/${team.id}/members/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secondUserToken}`,
        },
        body: JSON.stringify({
          role: "admin",
        }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /teams/:id/members/:userId", () => {
    it("should remove member from team", async () => {
      const team = await createTestTeam(authToken);
      
      // Add member first
      await SELF.fetch(`http://localhost/teams/${team.id}/members`, {
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

      // Remove member
      const response = await SELF.fetch(`http://localhost/teams/${team.id}/members/${secondUserId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(204);
    });

    it("should allow member to remove themselves", async () => {
      const team = await createTestTeam(authToken);
      
      // Add member first
      await SELF.fetch(`http://localhost/teams/${team.id}/members`, {
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

      // Member removes themselves
      const response = await SELF.fetch(`http://localhost/teams/${team.id}/members/${secondUserId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${secondUserToken}`,
        },
      });

      expect(response.status).toBe(204);
    });

    it("should fail to remove owner", async () => {
      const team = await createTestTeam(authToken);

      const response = await SELF.fetch(`http://localhost/teams/${team.id}/members/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain("Cannot remove team owner");
    });
  });
});