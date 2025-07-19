import { os } from "~/server/orpc/index"
import { ORPCError } from "@orpc/server"
import type { AuthenticatedContext, Context } from "~/server/orpc/types"

export const authRequired = os.middleware(async ({ context, next }) => {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" })
  }

  return next({
    context: {
      ...context,
      user: context.user,
    },
  })
})

export const emailVerificationRequired = os.middleware(async ({ context, next }) => {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" })
  }

  if (!context.user.emailVerified) {
    throw new ORPCError("FORBIDDEN", { message: "Email verification required" })
  }

  return next({
    context: {
      ...context,
      user: context.user,
    },
  })
})