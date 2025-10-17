import type { H3EventContext as BaseH3EventContext } from "h3";
import type { H3EventContext } from "../types/bindings";
import { createPrismaClient } from "../utils/prisma";

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("request", async (event) => {
		const context = event.context as BaseH3EventContext & H3EventContext;

		// Cloudflare環境でPrismaクライアントを初期化
		if (context.cloudflare?.env?.DB) {
			// Envにprismaプロパティはないがランタイムでプロパティとして追加
			context.cloudflare.env.prisma = createPrismaClient(
				context.cloudflare.env.DB,
			);
		}
	});
});
