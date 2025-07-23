import { ORPCError } from "@orpc/server";
import { os } from "~/server/orpc/index";

export const debugProcedures = {
	// Test endpoint that throws an ORPCError directly
	throwUnauthorized: os
		.route({
			method: "GET",
			path: "/debug/unauthorized",
			description: "Test endpoint that throws UNAUTHORIZED",
		})
		.handler(async () => {
			console.log("Debug: About to throw UNAUTHORIZED ORPCError");
			throw new ORPCError("UNAUTHORIZED", { message: "Test unauthorized error" });
		}),

	// Test endpoint with error definition
	throwUnauthorizedWithDef: os
		.errors({
			UNAUTHORIZED: {
				status: 401,
				message: "Test unauthorized with definition",
			},
		})
		.route({
			method: "GET",
			path: "/debug/unauthorized-def",
			description: "Test endpoint that throws UNAUTHORIZED with error definition",
		})
		.handler(async () => {
			console.log("Debug: About to throw UNAUTHORIZED with definition");
			throw new ORPCError("UNAUTHORIZED");
		}),

	// Test endpoint that throws a NOT_FOUND error
	throwNotFound: os
		.route({
			method: "GET",
			path: "/debug/notfound",
			description: "Test endpoint that throws NOT_FOUND",
		})
		.handler(async () => {
			console.log("Debug: About to throw NOT_FOUND ORPCError");
			throw new ORPCError("NOT_FOUND", { message: "Test not found error" });
		}),

	// Test endpoint that throws a custom error
	throwCustom: os
		.route({
			method: "GET",
			path: "/debug/custom",
			description: "Test endpoint that throws custom error",
		})
		.handler(async () => {
			console.log("Debug: About to throw custom error");
			throw new Error("This is a regular JavaScript error");
		}),

	// Test endpoint that succeeds
	success: os
		.route({
			method: "GET",
			path: "/debug/success",
			description: "Test endpoint that succeeds",
		})
		.handler(async () => {
			console.log("Debug: Returning success");
			return { message: "Success!", timestamp: Date.now() };
		}),
};
