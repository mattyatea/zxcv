// @ts-ignore - Cloudflare test module
// @ts-ignore - Cloudflare test module
import {
	applyD1Migrations,
	createExecutionContext,
	env,
	waitOnExecutionContext,
} from "cloudflare:test";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { RPCHandler } from "@orpc/server/fetch";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Router } from "~/server/orpc/router";
import { router } from "~/server/orpc/router";
import { cleanupTestData, createTestPrismaClient } from "../helpers/db-utils";

// Real database test with actual D1
// TODO: Fix mock interference - the global mock is preventing real D1 database usage
describe.skip("Auth Integration Tests with Real DB", () => {
	let client: ReturnType<typeof createORPCClient<Router>>;

	beforeEach(async () => {
		// Skip this test suite if we're using mocked Prisma
		// The auth-with-db test is meant to test with real D1, but our mock is interfering
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
					return new Response(
						JSON.stringify({
							error: { code: "NOT_FOUND", message: "Procedure not found" },
						}),
						{ status: 404 },
					);
				}

				return result.response;
			},
		});

		client = createORPCClient<Router>(link);
	});

	afterEach(async () => {
		// Clean up test data using the test utilities
		const db = createTestPrismaClient(env.DB);
		await cleanupTestData(db);
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
			expect(result.message).toContain("登録が完了しました");
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
			await expect(client.auth.register(registerInput)).rejects.toThrow(
				"このメールアドレスは既に使用されています",
			);
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
				}),
			).rejects.toThrow("メールアドレスまたはパスワードが無効です");
		});
	});
});
