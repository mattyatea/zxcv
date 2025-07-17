import { describe, expect, it, beforeEach } from "vitest";
import { SELF, env } from "cloudflare:test";
import { createPrismaClient } from "../../src/utils/prisma";
import { setupTestHooks, createTestUser } from "../helpers/setup";

describe("Debug API Keys", () => {
  setupTestHooks();
  
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const result = await createTestUser({
      email: `debug-${Date.now()}@example.com`,
      username: `debug${Math.floor(Math.random() * 10000)}`,
      password: "password123",
    });
    authToken = result.token;
    userId = result.user.id;
  });

  it("should check database schema", async () => {
    const prisma = createPrismaClient(env.DB);
    
    try {
      // Try to query the api_keys table structure
      const result = await env.DB.prepare(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='api_keys'"
      ).first();
      
      console.log("API Keys table schema:", result);
      
      // Also try a direct query
      const columns = await env.DB.prepare(
        "PRAGMA table_info(api_keys)"
      ).all();
      
      console.log("API Keys columns:", columns);
      
      expect(result).toBeDefined();
    } catch (error) {
      console.error("Schema check error:", error);
      throw error;
    }
  });

  it("should create API key with direct DB call", async () => {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      // Try direct insert without scopes column
      const result = await env.DB.prepare(
        `INSERT INTO api_keys (id, user_id, name, key_hash, created_at) 
         VALUES (?, ?, ?, ?, ?)`
      ).bind("test-id", userId, "Test Key", "test-hash", now).run();
      
      console.log("Direct insert result:", result);
      
      expect(result.success).toBe(true);
    } catch (error) {
      console.error("Direct insert error:", error);
      throw error;
    }
  });
});