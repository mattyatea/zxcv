import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../types";

export class HealthCheckEndpoint extends OpenAPIRoute {
	schema = {
		tags: ["Health"],
		summary: "Health check endpoint",
		responses: {
			"200": {
				description: "Service is healthy",
				content: {
					"application/json": {
						schema: z.object({
							status: z.string(),
							timestamp: z.number(),
							uptime: z.number(),
							version: z.string(),
							environment: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const startTime = Date.now();

		return c.json({
			status: "healthy",
			timestamp: startTime,
			uptime: process.uptime ? process.uptime() : 0,
			version: "1.0.0",
			environment: process.env.NODE_ENV || "development",
		});
	}
}
