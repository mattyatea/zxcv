import type { H3EventContext as BaseH3EventContext } from "h3";
import type { H3EventContext } from "~/server/types/bindings";
import { createPrismaClient } from "~/server/utils/prisma";

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("request", async (event) => {
		const context = event.context as BaseH3EventContext & H3EventContext;

		// Cloudflare環境でPrismaクライアントを初期化
		if (context.cloudflare?.env?.DB) {
			context.cloudflare.env.prisma = createPrismaClient(context.cloudflare.env.DB);
		}
	});
});
