// Use the global Env type from worker-configuration.d.ts
export type CloudflareBindings = Env;

export interface H3EventContext {
	cloudflare: {
		env: CloudflareBindings;
		context: ExecutionContext;
		request: Request;
	};
}
