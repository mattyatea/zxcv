import { z } from "zod";
import { os } from "~/server/orpc/index";

export const healthProcedures = {
	check: os
		.route({
			method: "GET",
			path: "/health",
			description: "Check the health status of the API",
		})
		.output(
			z.object({
				status: z.literal("healthy"),
				timestamp: z.number(),
			}),
		)
		.handler(async () => {
			const startTime = Date.now();

			return {
				status: "healthy",
				timestamp: startTime,
			};
		}),
};
