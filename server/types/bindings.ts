import type { Env } from "~/server/types/env";

export interface CloudflareBindings extends Env {}

export interface H3EventContext {
	cloudflare: {
		env: CloudflareBindings;
		context: ExecutionContext;
		request: Request;
	};
}
