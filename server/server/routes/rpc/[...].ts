import { RPCHandler } from "@orpc/server/fetch";
import type { H3EventContext as BaseH3EventContext, H3Event } from "h3";
import { defineEventHandler, setResponseStatus } from "h3";
import { router } from "~/server/orpc/router";
import type { H3EventContext } from "~/server/types/bindings";
import {
	createRequestFromEvent,
	ensureCloudflareContext,
	getAuthUser,
	handleError,
	sendResponse,
} from "~/server/utils/orpcHandler";

const handler = new RPCHandler(router);

export default defineEventHandler(async (event: H3Event) => {
	console.log("RPC handler called:", {
		method: event.node.req.method,
		url: event.node.req.url,
		path: event.path,
	});

	// In test environment, ensure context is properly set
	const context = event.context as BaseH3EventContext & H3EventContext;
	ensureCloudflareContext(event);

	try {
		const user = await getAuthUser(event);
		const request = await createRequestFromEvent(event);

		console.log("Request URL:", request.url);
		console.log("Request method:", request.method);
		console.log("User authenticated:", !!user);

		let response: Awaited<ReturnType<typeof handler.handle>>;
		try {
			response = await handler.handle(request, {
				prefix: "/rpc",
				context: {
					user,
					env: context.cloudflare.env,
					cloudflare: context.cloudflare,
				},
			});
		} catch (handlerError) {
			console.error("Handler error details:", {
				error: handlerError,
				message: (handlerError as { message?: string })?.message,
				code: (handlerError as { code?: string })?.code,
				stack: (handlerError as { stack?: string })?.stack,
			});
			throw handlerError;
		}

		console.log("Response matched:", response.matched);
		console.log("Response status:", response.response?.status);

		if (!response.matched) {
			setResponseStatus(event, 404, "Not Found");
			return { error: "Not found" };
		}

		return await sendResponse(event, response.response);
	} catch (error) {
		return await handleError(event, error);
	}
});
