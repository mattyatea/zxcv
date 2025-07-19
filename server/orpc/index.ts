import { os as baseOs } from "@orpc/server"
import type { Context } from "~/server/orpc/types"

export const os = baseOs.$context<Context>()