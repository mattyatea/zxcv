import { call } from "@orpc/server";
import type { Context } from "~/server/orpc/types";
import { createMockContext } from "./mocks";

// Helper to call oRPC procedure directly using the official oRPC testing pattern
// Following oRPC documentation: https://orpc.unnoq.com/docs/advanced/testing-mocking
// biome-ignore lint/suspicious/noExplicitAny: Generic test helper needs flexible input/output types
export async function callProcedure<TInput = any, TOutput = any>(
	// biome-ignore lint/suspicious/noExplicitAny: Procedure type is complex and varies per test
	procedure: any,
	input?: TInput,
	context?: Partial<Context>,
): Promise<TOutput> {
	const ctx = createMockContext(context);
	// Direct call pattern from oRPC docs
	return await call(procedure, input, ctx);
}

// Helper for authenticated procedure calls
// biome-ignore lint/suspicious/noExplicitAny: Generic test helper needs flexible input/output types
export async function callAuthenticatedProcedure<TInput = any, TOutput = any>(
	// biome-ignore lint/suspicious/noExplicitAny: Procedure type is complex and varies per test
	procedure: any,
	user: { id: string; email: string; username: string; emailVerified?: boolean },
	input?: TInput,
	contextOverrides?: Partial<Context>,
): Promise<TOutput> {
	const ctx = createMockContext({
		...contextOverrides,
		user: { ...user, emailVerified: user.emailVerified ?? true },
	});
	return await call(procedure, input, ctx);
}

// Note: For error testing, use expect().rejects.toThrow() pattern directly in tests
// as recommended by oRPC documentation