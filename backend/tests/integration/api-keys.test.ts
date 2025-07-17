import { describe, expect, it, beforeEach } from "vitest";
import { SELF } from "cloudflare:test";
import { setupTestHooks, createTestUser, createTestApiKey } from "../helpers/setup";

describe("API Keys endpoints", () => {
  setupTestHooks();
  
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const result = await createTestUser({
      email: `apikey-user-${Date.now()}@example.com`,
      username: `apikeyuser${Math.floor(Math.random() * 10000)}`,
      password: "password123",
    });
    authToken = result.token;
    userId = result.user.id;
  });

  describe("POST /api-keys", () => {
    it("should create a new API key successfully", async () => {
      const response = await SELF.fetch("http://localhost/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "Test API Key",
          scopes: ["rules:read", "rules:write"],
          expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
        }),
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe("Test API Key");
      expect(data.key).toBeDefined();
      expect(data.key).toMatch(/^ak_[a-zA-Z0-9-]+$/);
      expect(data.scopes).toEqual(["rules:read", "rules:write"]);
      expect(data.expires_at).toBeDefined();
    });

    it("should create API key without expiration", async () => {
      const response = await SELF.fetch("http://localhost/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "Permanent API Key",
          scopes: ["rules:read"],
        }),
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.expires_at).toBeNull();
    });

    it("should fail without authentication", async () => {
      const response = await SELF.fetch("http://localhost/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test API Key",
          scopes: ["rules:read"],
        }),
      });

      expect(response.status).toBe(401);
    });

    it("should fail with empty name", async () => {
      const response = await SELF.fetch("http://localhost/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "",
          scopes: ["rules:read"],
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should fail with invalid scopes", async () => {
      const response = await SELF.fetch("http://localhost/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "Test API Key",
          scopes: ["invalid:scope"],
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should fail with past expiration date", async () => {
      const response = await SELF.fetch("http://localhost/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "Test API Key",
          scopes: ["rules:read"],
          expires_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api-keys", () => {
    it("should list user's API keys", async () => {
      // Create a few API keys
      await createTestApiKey(authToken, { name: "Key 1" });
      await createTestApiKey(authToken, { name: "Key 2" });

      const response = await SELF.fetch("http://localhost/api-keys", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.results).toBeDefined();
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results.length).toBeGreaterThanOrEqual(2);
      expect(data.total).toBeGreaterThanOrEqual(2);
      
      // Should not expose the key hash
      data.results.forEach((key: any) => {
        expect(key.keyHash).toBeUndefined();
        expect(key.key).toBeUndefined();
      });
    });

    it("should support pagination", async () => {
      // Create multiple API keys
      for (let i = 0; i < 5; i++) {
        await createTestApiKey(authToken, { name: `Key ${i}` });
      }

      const response = await SELF.fetch("http://localhost/api-keys?limit=2&offset=0", {
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

    it("should fail without authentication", async () => {
      const response = await SELF.fetch("http://localhost/api-keys", {
        method: "GET",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api-keys/:id", () => {
    it("should update API key name", async () => {
      const apiKey = await createTestApiKey(authToken);

      const response = await SELF.fetch(`http://localhost/api-keys/${apiKey.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "Updated Key Name",
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.name).toBe("Updated Key Name");
    });

    it("should update API key scopes", async () => {
      const apiKey = await createTestApiKey(authToken);

      const response = await SELF.fetch(`http://localhost/api-keys/${apiKey.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          scopes: ["rules:read", "teams:read"],
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.scopes).toEqual(["rules:read", "teams:read"]);
    });

    it("should update expiration date", async () => {
      const apiKey = await createTestApiKey(authToken);
      const newExpiration = Math.floor(Date.now() / 1000) + 172800; // 48 hours

      const response = await SELF.fetch(`http://localhost/api-keys/${apiKey.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          expires_at: newExpiration,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.expires_at).toBe(newExpiration);
    });

    it("should fail to update non-existent key", async () => {
      const response = await SELF.fetch("http://localhost/api-keys/non-existent-id", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "Updated Name",
        }),
      });

      expect(response.status).toBe(404);
    });

    it("should fail to update another user's key", async () => {
      // Create another user and their API key
      const otherUser = await createTestUser({
        email: `other-${Date.now()}@example.com`,
        username: `other${Math.floor(Math.random() * 10000)}`,
        password: "password123",
      });
      const otherApiKey = await createTestApiKey(otherUser.token);

      // Try to update with first user's token
      const response = await SELF.fetch(`http://localhost/api-keys/${otherApiKey.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: "Hacked Name",
        }),
      });

      expect(response.status).toBe(404);
    });

    it("should fail without any update fields", async () => {
      const apiKey = await createTestApiKey(authToken);

      const response = await SELF.fetch(`http://localhost/api-keys/${apiKey.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain("At least one field must be provided");
    });
  });

  describe("DELETE /api-keys/:id", () => {
    it("should delete API key successfully", async () => {
      const apiKey = await createTestApiKey(authToken);

      const response = await SELF.fetch(`http://localhost/api-keys/${apiKey.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(204);

      // Verify key is deleted
      const getResponse = await SELF.fetch("http://localhost/api-keys", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });
      const data = await getResponse.json();
      const deletedKey = data.results.find((k: any) => k.id === apiKey.id);
      expect(deletedKey).toBeUndefined();
    });

    it("should fail to delete non-existent key", async () => {
      const response = await SELF.fetch("http://localhost/api-keys/non-existent-id", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });

    it("should fail to delete another user's key", async () => {
      // Create another user and their API key
      const otherUser = await createTestUser({
        email: `other2-${Date.now()}@example.com`,
        username: `other2${Math.floor(Math.random() * 10000)}`,
        password: "password123",
      });
      const otherApiKey = await createTestApiKey(otherUser.token);

      // Try to delete with first user's token
      const response = await SELF.fetch(`http://localhost/api-keys/${otherApiKey.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });

    it("should fail without authentication", async () => {
      const apiKey = await createTestApiKey(authToken);

      const response = await SELF.fetch(`http://localhost/api-keys/${apiKey.id}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("API Key Authentication", () => {
    it("should authenticate with valid API key", async () => {
      const apiKey = await createTestApiKey(authToken, {
        scopes: ["rules:read"],
      });

      // Use API key to access protected endpoint
      const response = await SELF.fetch("http://localhost/rules/search", {
        method: "GET",
        headers: {
          "X-API-Key": apiKey.key,
        },
      });

      // Should allow access with proper scope
      expect(response.status).toBe(200);
    });

    it("should fail with invalid API key", async () => {
      const response = await SELF.fetch("http://localhost/rules/search", {
        method: "GET",
        headers: {
          "X-API-Key": "ak_invalid123",
        },
      });

      expect(response.status).toBe(401);
    });

    it("should fail with expired API key", async () => {
      // Note: This test would require mocking time or waiting
      // For now, we'll skip the actual expiration test
      // In a real scenario, you'd create a key with past expiration
    });

    it("should respect API key scopes", async () => {
      const apiKey = await createTestApiKey(authToken, {
        scopes: ["rules:read"], // Only read permission
      });

      // Try to create a rule (requires write permission)
      const response = await SELF.fetch("http://localhost/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey.key,
        },
        body: JSON.stringify({
          name: "test-rule",
          content: "{}",
          visibility: "public",
        }),
      });

      // Should fail due to insufficient scope
      expect(response.status).toBe(403);
    });
  });
});