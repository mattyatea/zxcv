import { OpenAPIHandler } from "@orpc/openapi/fetch";
import type { H3EventContext as BaseH3EventContext, H3Event } from "h3";
import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { router } from "../../orpc/router";
import type { H3EventContext } from "../../types/bindings";
import {
	createRequestFromEvent,
	ensureCloudflareContext,
	getAuthUser,
	handleError,
	sendResponse,
} from "../../utils/orpcHandler";

const handler = new OpenAPIHandler(router);

export default defineEventHandler(async (event: H3Event) => {
	// In test environment, ensure context is properly set
	const context = event.context as BaseH3EventContext & H3EventContext;
	ensureCloudflareContext(event);

	try {
		const user = await getAuthUser(event);
		const request = await createRequestFromEvent(event);

		// リクエスト情報のログは削除（必要最小限に）

		let response: Awaited<ReturnType<typeof handler.handle>>;
		try {
			response = await handler.handle(request, {
				prefix: "/api",
				context: {
					user,
					env: context.cloudflare.env,
					cloudflare: context.cloudflare,
				},
			});
		} catch (handlerError) {
			// エラー時のみ簡潔にログ出力
			console.error("[API Error]", event.path, (handlerError as { message?: string })?.message);
			throw handlerError;
		}

		if (!response.matched) {
			setResponseStatus(event, 404, "Not Found");
			return { error: "Not found" };
		}

		return await sendResponse(event, response.response);
	} catch (error) {
		return await handleError(event, error);
	}
});
