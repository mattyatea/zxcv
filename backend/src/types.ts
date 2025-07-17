import type { Context } from "hono";
import type { AuthContext } from "./middleware/auth";
import type { Env } from "./types/env";

export type AppContext = Context<{ Bindings: Env; Variables: AuthContext }>;
export type HandleArgs = [AppContext];
