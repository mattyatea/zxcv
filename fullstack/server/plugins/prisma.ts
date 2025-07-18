import type { H3EventContext } from "~/server/types/bindings";
import { createPrismaClient } from "~/server/utils/prisma";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    const context = event.context as H3EventContext;
    
    // Cloudflare環境でPrismaクライアントを初期化
    if (context.cloudflare?.env?.DB) {
      context.cloudflare.env.prisma = createPrismaClient(context.cloudflare.env.DB);
    }
  });
});