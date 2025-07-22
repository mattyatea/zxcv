import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "~/server/orpc/router";
import type { Router } from "~/server/orpc/router";
import type { Context } from "~/server/orpc/types";
import { createMockContext } from "./mocks";
import { createMockPrismaClient } from "./test-db";

// Create a test oRPC client that can call procedures directly
export function createTestORPCClient(contextOverrides?: Partial<Context>) {
	// Use the global mock database instead of creating a new one
	const mockDb = contextOverrides?.db || (globalThis as any).__mockPrismaClient || createMockPrismaClient();
	const mockContext = createMockContext({
		...contextOverrides,
		db: mockDb,
	});
	
	// Create RPC handler
	const handler = new RPCHandler(router);
	
	// Create a custom link that calls the handler directly
	const testLink = new RPCLink({
		url: "http://test.local/rpc",
		// @ts-ignore - Type mismatch between oRPC and Fetch API
		fetch: async (url: string | URL, init?: RequestInit) => {
			// Create a request object
			const request = new Request(url, init);
			
			// Call the handler
			try {
				// Inject the mock db into the context before calling handler
				const result = await handler.handle(request, {
					prefix: "/rpc",
					context: {
						...mockContext,
						db: mockDb, // Ensure db is always available
					},
				});
				
				if (!result.matched) {
					return new Response(JSON.stringify({ 
						error: { code: "NOT_FOUND", message: "Procedure not found" } 
					}), { status: 404 });
				}
				
				return result.response;
			} catch (error) {
				console.error("Handler error:", error);
				console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
				console.error("Error details:", JSON.stringify(error, null, 2));
				return new Response(JSON.stringify({ 
					error: { 
						code: "INTERNAL_SERVER_ERROR", 
						message: error instanceof Error ? error.message : "Internal server error" 
					} 
				}), { status: 500 });
			}
		}
	});
	
	// Create and return the client
	return { client: createORPCClient<Router>(testLink), mockDb };
}

// Helper to create authenticated test client
export function createAuthenticatedTestClient(
	user: { id: string; email: string; username: string; emailVerified: boolean },
	contextOverrides?: Partial<Context>
) {
	return createTestORPCClient({
		...contextOverrides,
		user,
	});
}