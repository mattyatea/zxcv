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
}

export interface AuthenticatedContext extends Context {
	user: AuthUser;
}

export interface DatabaseContext extends Context {
	db: PrismaClient;
}

export interface AuthenticatedDatabaseContext extends DatabaseContext {
	user: AuthUser;
}
