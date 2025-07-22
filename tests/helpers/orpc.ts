import { RPCHandler } from "@orpc/server/fetch";
import type { Context } from "~/server/orpc/types";
import { createMockContext } from "./mocks";

// Helper to call oRPC procedure directly by creating a temporary router
export async function callProcedure<TInput = any, TOutput = any>(
	procedure: any,
	input?: TInput,
	context?: Partial<Context>,
): Promise<TOutput> {
	const ctx = createMockContext(context);
	
	// Create a temporary router with just this procedure
	const tempRouter = {
		testProcedure: procedure
	};
	
	// Create RPC handler
	const handler = new RPCHandler(tempRouter);
	
	// Create a mock request with oRPC format
	// Wrap the input in the standard oRPC format
	const requestBody = {
		json: input || {}
	};
	
	const request = new Request("http://localhost/rpc/testProcedure", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(requestBody),
	});
	
	// Call the handler
	const bodyText = await request.clone().text();
	console.error("Calling handler with URL:", request.url);
	console.error("Request method:", request.method);
	console.error("Request body:", bodyText);
	console.error("Context:", JSON.stringify(ctx, null, 2));
	
	const response = await handler.handle(request, {
		prefix: "/rpc",
		context: ctx,
	});
	
	if (!response.matched) {
		throw new Error("Procedure not found");
	}
	
	// Parse the response
	const responseText = await response.response.text();
	
	// Debug logging
	if (process.env.DEBUG_ORPC_TEST) {
		console.log("Response status:", response.response.status);
		console.log("Response text:", responseText);
	}
	
	let responseData;
	try {
		responseData = JSON.parse(responseText);
	} catch (e) {
		// If JSON parsing fails, throw error with the text
		throw new Error(`Failed to parse response: ${responseText}`);
	}
	
	// Check if this is a JSON error response (what we're seeing)
	if (responseData.json && responseData.json.code) {
		console.error("Error response:", JSON.stringify(responseData.json, null, 2));
		// Import ORPCError and throw it properly
		const { ORPCError } = await import("@orpc/server");
		throw new ORPCError(responseData.json.code as any, { 
			message: responseData.json.message || "Procedure error",
			...responseData.json.data 
		});
	}
	
	// oRPC standard error format
	if (responseData.error) {
		const error = new Error(responseData.error.message || "Procedure error");
		Object.assign(error, responseData.error);
		throw error;
	}
	
	// Success - oRPC wraps the response in a json property
	return responseData.json || responseData;
}

// Helper to test oRPC error responses
export async function expectORPCError<TInput = any>(
	procedure: any,
	input?: TInput,
	context?: Partial<Context>,
): Promise<Error> {
	try {
		await callProcedure(procedure, input, context);
		throw new Error("Expected procedure to throw an error");
	} catch (error) {
		// If the error has the oRPC error structure, recreate it as ORPCError
		if (error && typeof error === 'object' && 'code' in error) {
			const { ORPCError } = await import("@orpc/server");
			const errorObj = error as any;
			const orpcError = new ORPCError(errorObj.code as any, { 
				message: errorObj.message,
				data: errorObj.data 
			});
			return orpcError;
		}
		return error as Error;
	}
}

// Helper to create authenticated procedure call
export async function callAuthenticatedProcedure<TInput = any, TOutput = any>(
	procedure: any,
	user: { id: string; email: string; username: string; emailVerified?: boolean },
	input?: TInput,
	contextOverrides?: Partial<Context>,
): Promise<TOutput> {
	return callProcedure(procedure, input, {
		...contextOverrides,
		user: { ...user, emailVerified: user.emailVerified ?? true },
	});
}