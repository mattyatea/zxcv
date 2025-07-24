import { oc } from "@orpc/contract";
import * as z from "zod";

export const healthContract = {
	check: oc
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
		),
};