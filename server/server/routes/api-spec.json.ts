import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { router } from "../orpc/router";

export default defineEventHandler(async () => {
	const generator = new OpenAPIGenerator({
		schemaConverters: [new ZodToJsonSchemaConverter()],
	});

	const spec = await generator.generate(router, {
		info: {
			title: "zxcv API",
			version: "1.0.0",
			description: "AI Coding Rules Management Platform API",
		},
		servers: [
			{
				url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/api`,
				description: "API Server",
			},
		],
	});

	return spec;
});
