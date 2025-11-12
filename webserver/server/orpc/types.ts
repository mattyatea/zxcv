import type { PrismaClient } from "@prisma/client";
import type { CloudflareBindings } from "../types/bindings";
import type { AuthUser } from "../utils/auth";

export interface Context {
	user?: AuthUser;
	env: CloudflareBindings;
	cloudflare: {
		env: CloudflareBindings;
		request?: Request;
		context: ExecutionContext;
	};
	db?: PrismaClient;
	locale: string;
}
