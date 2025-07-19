export interface CloudflareBindings {
	DB: D1Database;
	R2: R2Bucket;
	EMAIL_SENDER: SendEmail;
	JWT_SECRET: string;
	JWT_ALGORITHM: string;
	JWT_EXPIRES_IN: string;
	RATE_LIMIT_ANONYMOUS: string;
	RATE_LIMIT_AUTHENTICATED: string;
	RATE_LIMIT_API_KEY: string;
	EMAIL_FROM: string;
	FRONTEND_URL: string;
	KV_CACHE: KVNamespace;
	prisma?: any;
}

export interface H3EventContext {
	cloudflare: {
		env: CloudflareBindings;
		context: ExecutionContext;
		request: Request;
	};
}