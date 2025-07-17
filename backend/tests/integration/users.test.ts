import { describe, expect, it, beforeEach } from "vitest";
import { SELF } from "cloudflare:test";
import { setupTestHooks, createTestUser } from "../helpers/setup";

describe("Users endpoints", () => {
  setupTestHooks();
  
  let authToken: string;
  let userId: string;
  let userEmail: string;
  let username: string;

  beforeEach(async () => {
    // Create test user
    const timestamp = Date.now();
    userEmail = `user-${timestamp}@example.com`;
    username = `user${Math.floor(Math.random() * 10000)}`;
    
    const result = await createTestUser({
      email: userEmail,
      username: username,
      password: "password123",
    });
    authToken = result.token;
    userId = result.user.id;
  });

  describe("GET /users/me", () => {
    it("should get current user profile", async () => {
      const response = await SELF.fetch("http://localhost/users/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.id).toBe(userId);
      expect(data.email).toBe(userEmail);
      expect(data.username).toBe(username);
      expect(data.created_at).toBeDefined();
      expect(data.updated_at).toBeDefined();
    });

    it("should fail without authentication", async () => {
      const response = await SELF.fetch("http://localhost/users/me", {
        method: "GET",
      });

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe("Authentication required");
    });

    it("should fail with invalid token", async () => {
      const response = await SELF.fetch("http://localhost/users/me", {
        method: "GET",
        headers: {
          "Authorization": "Bearer invalid-token",
        },
      });

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe("Authentication required");
    });
  });

  describe("PUT /users/me", () => {
    it("should update username", async () => {
      const newUsername = `updated${Math.floor(Math.random() * 10000)}`;
      
      const response = await SELF.fetch("http://localhost/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: newUsername,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.username).toBe(newUsername);
      expect(data.email).toBe(userEmail);
    });

    it("should update email", async () => {
      const newEmail = `updated-${Date.now()}@example.com`;
      
      const response = await SELF.fetch("http://localhost/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          email: newEmail,
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.email).toBe(newEmail);
      expect(data.username).toBe(username);
    });

    it("should fail with duplicate email", async () => {
      // Create another user
      const anotherEmail = `another-${Date.now()}@example.com`;
      await createTestUser({
        email: anotherEmail,
        username: "anotheruser",
        password: "password123",
      });

      // Try to update to the same email
      const response = await SELF.fetch("http://localhost/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          email: anotherEmail,
        }),
      });

      expect(response.status).toBe(409);
      
      const data = await response.json();
      expect(data.error).toContain("already exists");
    });

    it("should fail with duplicate username", async () => {
      // Create another user
      const anotherUsername = `another${Math.floor(Math.random() * 10000)}`;
      await createTestUser({
        email: `another2-${Date.now()}@example.com`,
        username: anotherUsername,
        password: "password123",
      });

      // Try to update to the same username
      const response = await SELF.fetch("http://localhost/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: anotherUsername,
        }),
      });

      expect(response.status).toBe(409);
      
      const data = await response.json();
      expect(data.error).toContain("already exists");
    });

    it("should fail with invalid email format", async () => {
      const response = await SELF.fetch("http://localhost/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          email: "invalid-email",
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should fail with invalid username format", async () => {
      const response = await SELF.fetch("http://localhost/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: "invalid username with spaces",
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should fail without authentication", async () => {
      const response = await SELF.fetch("http://localhost/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newusername",
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /users/me/settings", () => {
    it("should get user settings with defaults", async () => {
      const response = await SELF.fetch("http://localhost/users/me/settings", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.settings).toBeDefined();
      expect(data.settings.theme).toBe("light");
      expect(data.settings.locale).toBe("en");
      expect(data.settings.timezone).toBe("UTC");
      expect(data.settings.notifications).toBeDefined();
      expect(data.settings.notifications.email).toBe(true);
      expect(data.settings.notifications.push).toBe(true);
    });

    it("should fail without authentication", async () => {
      const response = await SELF.fetch("http://localhost/users/me/settings", {
        method: "GET",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /users/me/settings", () => {
    it("should update theme setting", async () => {
      const response = await SELF.fetch("http://localhost/users/me/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          theme: "dark",
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.settings.theme).toBe("dark");
      // Other settings should remain default
      expect(data.settings.locale).toBe("en");
      expect(data.settings.timezone).toBe("UTC");
    });

    it("should update multiple settings", async () => {
      const response = await SELF.fetch("http://localhost/users/me/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          theme: "dark",
          locale: "ja",
          timezone: "Asia/Tokyo",
          notifications: {
            email: false,
            push: true,
          },
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.settings.theme).toBe("dark");
      expect(data.settings.locale).toBe("ja");
      expect(data.settings.timezone).toBe("Asia/Tokyo");
      expect(data.settings.notifications.email).toBe(false);
      expect(data.settings.notifications.push).toBe(true);
    });

    it("should merge settings correctly", async () => {
      // First update some settings
      await SELF.fetch("http://localhost/users/me/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          theme: "dark",
          locale: "ja",
        }),
      });

      // Then update only theme
      const response = await SELF.fetch("http://localhost/users/me/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          theme: "light",
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.settings.theme).toBe("light");
      // Locale should remain as previously set
      expect(data.settings.locale).toBe("ja");
    });

    it("should validate theme value", async () => {
      const response = await SELF.fetch("http://localhost/users/me/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          theme: "invalid-theme",
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should validate locale format", async () => {
      const response = await SELF.fetch("http://localhost/users/me/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          locale: "invalid",
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should validate timezone format", async () => {
      const response = await SELF.fetch("http://localhost/users/me/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          timezone: "Invalid/Timezone",
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should fail without authentication", async () => {
      const response = await SELF.fetch("http://localhost/users/me/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: "dark",
        }),
      });

      expect(response.status).toBe(401);
    });
  });
});