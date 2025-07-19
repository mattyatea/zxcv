import { os } from "~/server/orpc/index"
import { createPrismaClient } from "~/server/utils/prisma"
import type { Context, DatabaseContext } from "~/server/orpc/types"

export const dbProvider = os.middleware(async ({ context, next }) => {
  const db = createPrismaClient(context.env.DB)
  
  return next({
    context: {
      ...context,
      db,
    },
  })
})