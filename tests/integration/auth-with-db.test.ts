import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
// @ts-ignore - Cloudflare test module
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
// @ts-ignore - Cloudflare test module
import { applyD1Migrations } from "cloudflare:test";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "~/server/orpc/router";
import type { Router } from "~/server/orpc/router";
import { createTestPrismaClient, cleanupTestData } from "../helpers/db-utils";

// Real database test with actual D1
describe("Auth Integration Tests with Real DB", () => {
	let client: ReturnType<typeof createORPCClient<Router>>;
	
	beforeEach(async () => {
		// Apply migrations to test database
		await applyD1Migrations(env.DB, env.MIGRATIONS);
		
		// Create handler with real context
		const handler = new RPCHandler(router);
		
		// Create client that connects to the handler
		const link = new RPCLink({
			url: "http://test.local/rpc",
			// @ts-ignore - Type mismatch between oRPC and Fetch API
			fetch: async (url: string | URL, init?: RequestInit) => {
				const request = new Request(url, init);
				const ctx = createExecutionContext();
				
				const result = await handler.handle(request, {
					prefix: "/rpc",
					context: {
						env,
						db: undefined, // Will be created by middleware
						user: undefined,
						cloudflare: {
							env,
							request,
							context: ctx,
						},
					},
				});
				
				await waitOnExecutionContext(ctx);
				
				if (!result.matched) {
					return new Response(JSON.stringify({ 
						error: { code: "NOT_FOUND", message: "Procedure not found" } 
					}), { status: 404 });
				}
				
				return result.response;
			},
		});
		
		client = createORPCClient<Router>(link);
	});
	
	afterEach(async () => {
		// Clean up test data
		const { createPrismaClient } = await import("~/server/utils/prisma");
		const db = createPrismaClient(env.DB);
		
		// Delete all test data
		await db.user.deleteMany();
		await db.emailVerification.deleteMany();
		await db.passwordReset.deleteMany();
		await db.ruleStar.deleteMany();
		await db.ruleDownload.deleteMany();
		await db.rule.deleteMany();
		await db.organization.deleteMany();
	});

	describe("User Registration Flow", () => {
		it("should register a new user successfully", async () => {
			const registerInput = {
				username: "testuser",
				email: "test@example.com", 
				password: "SecurePassword123!",
			};

			const result = await client.auth.register(registerInput);
			
			expect(result.success).toBe(true);
			expect(result.message).toContain("Registration successful");
			expect(result.user).toMatchObject({
				username: "testuser",
				email: "test@example.com",
			});
		});
		
		it("should reject duplicate registrations", async () => {
			const registerInput = {
				username: "testuser",
				email: "test@example.com",
				password: "SecurePassword123!",
			};
			
			// First registration
			await client.auth.register(registerInput);
			
			// Try to register again
			await expect(
				client.auth.register(registerInput)
			).rejects.toThrow("User already exists");
		});
	});
	
	describe("User Login Flow", () => {
		it("should login with valid credentials", async () => {
			// Register a user first
			await client.auth.register({
				username: "testuser",
				email: "test@example.com",
				password: "SecurePassword123!",
			});
			
			// Try to login
			const loginResult = await client.auth.login({
				email: "test@example.com",
				password: "SecurePassword123!",
			});
			
			expect(loginResult.accessToken).toBeDefined();
			expect(loginResult.refreshToken).toBeDefined();
			expect(loginResult.user).toMatchObject({
				username: "testuser",
				email: "test@example.com",
			});
		});
		
		it("should reject invalid credentials", async () => {
			await expect(
				client.auth.login({
					email: "nonexistent@example.com",
					password: "wrongpassword",
				})
			).rejects.toThrow("Invalid email or password");
		});
	});
});